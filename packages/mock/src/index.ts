import * as ts from 'typescript';
import { generate_cn, generate_en, generate_string } from './string';
import { randomFloatNum, randomNum } from './number';
import {
	BASIC_FIXED,
	BASIC_MAX_NUMBER,
	BASIC_MAX_STRING,
	BASIC_MIN_NUMBER,
	BASIC_MIN_STRING,
	MAX_REFERENCE
} from './const';

type Node = ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration | ts.ModuleDeclaration;

type MockType = 'string' | 'number' | 'number_float' | 'array' | 'object';

interface MockBasicOptions<T = any> {
	type: MockType;
	value?: T | ((origin: T) => any);
}

interface MockStringOptions extends MockBasicOptions {
	type: 'string';
	min?: number;
	max?: number;
	language?: 'zh' | 'en' | 'zh_en';
	value?: any | ((origin: string) => any);
}

interface MockNumberOptions extends MockBasicOptions {
	type: 'number' | 'number_float';
	min?: number;
	max?: number;
	fixed?: number;
	value?: any | ((origin: number) => any);
}

interface MockArrayOptions extends MockBasicOptions {
	type: 'array';
	value?: any[] | ((origin: any[]) => any);
	length: number;
}

type CustomMockOptions = MockStringOptions | MockNumberOptions | MockArrayOptions;

interface MockOptions {
	$$pre_type?: string;
	$$reference?: number;
	[key: string]: CustomMockOptions | string | number | undefined;
}

class Mock {
	private source: string;
	private sourceFile: ts.SourceFile;
	private map: Map<string, Node>;
	constructor(source: string) {
		this.source = source;
		this.map = new Map();
		this.sourceFile = this.createSourceFile();
		this.collect();
	}

	private createSourceFile() {
		return ts.createSourceFile(
			'example.ts', // 文件名（可以随意）
			this.source, // TypeScript 源代码字符串
			ts.ScriptTarget.Latest, // 目标脚本版本
			true // 设置为true以便跟踪节点位置信息
		);
	}

	private collect() {
		this.sourceFile.forEachChild(node => {
			if (
				ts.isInterfaceDeclaration(node) ||
				ts.isTypeAliasDeclaration(node) ||
				ts.isEnumDeclaration(node) ||
				ts.isModuleDeclaration(node)
			) {
				this.map.set(node.name.text, node);
			}
		});
	}

	generate(name: string, option: MockOptions = {}) {
		const node = this.map.get(name);
		if (!node) {
			return {
				code: 404,
				error: `未在类型文件中找到类型${name}`
			};
		}
		const obj: Record<string, any> = {};
		switch (node.kind) {
			case ts.SyntaxKind.InterfaceDeclaration:
				const interfaceDeclaration = node as ts.InterfaceDeclaration;
				interfaceDeclaration.members.forEach(member => {
					if (ts.isPropertySignature(member)) {
						const key = member.name.getText();
						option.$$pre_type = name;
						let value = null;
						if (option[key] && typeof option[key] === 'object') {
							const custom = option[key] as CustomMockOptions;
							value = this.generateCustom(member.type, custom);
						} else value = this.generateByType(member.type, { ...option });
						obj[key] = value;
					}
				});
				return obj;
			case ts.SyntaxKind.EnumDeclaration: {
				const enumDeclaration = node as ts.EnumDeclaration;
				const enumMenber = enumDeclaration.members[randomNum(0, enumDeclaration.members.length - 1)];
				let value = enumMenber.name.getText();
				value = enumMenber.initializer?.getText() || value;
				return { value };
			}
			default:
				return {};
		}
	}

	private generateBasic(type?: ts.TypeNode, option: MockOptions = {}) {
		if (!type) return null;
		switch (type.kind) {
			case ts.SyntaxKind.StringKeyword:
				return this.generateString({ type: 'string' });
			case ts.SyntaxKind.NumberKeyword:
				return this.generateNumber({ type: Math.random() >= 0.5 ? 'number' : 'number_float' });
			case ts.SyntaxKind.TypeReference:
				return this.generateReference(type as ts.TypeReferenceNode, { ...option });
			case ts.SyntaxKind.ArrayType:
				const array: any[] = [];
				this.execCount(
					() => array.push(this.generateByType((type as ts.ArrayTypeNode).elementType, { ...option })),
					10
				);
				return array;
			case ts.SyntaxKind.BooleanKeyword:
				return Math.random() > 0.5 ? true : false;
			default:
				return null;
		}
	}

	private generateByType(type?: ts.TypeNode, option: MockOptions = {}): any {
		if (!type) return null;
		if (option.$$reference && option.$$reference >= MAX_REFERENCE) return;
		if (type.getText() === option.$$pre_type) option.$$reference = option.$$reference ? option.$$reference + 1 : 1;
		if (this.map.has(type.getText())) {
			return this.generate(type.getText(), { ...option });
		} else {
			return this.generateBasic(type, { ...option });
		}
	}

	private generateReference(type: ts.TypeReferenceNode, option: MockOptions = {}, length = 10) {
		const name = type.typeName.getText();

		switch (name) {
			case 'Map': {
				const map = new Map();
				const key = type.typeArguments?.[0]?.getText();
				if (type.typeArguments?.[0] && this.map.has(key!)) {
					const enumDeclaration = this.map.get(key!) as ts.EnumDeclaration;
					enumDeclaration.members.forEach(enumMenber => {
						let enumValue = enumMenber.name.getText();
						enumValue = enumMenber.initializer?.getText() || enumValue;
						map.set(enumValue, this.generateByType(type.typeArguments?.[1], { ...option }));
					});
				} else {
					this.execCount(() => {
						const obj = this.generateByType(type.typeArguments?.[0], { ...option });
						map.set(obj.value || obj, this.generateByType(type.typeArguments?.[1], { ...option }));
					}, length);
				}

				return map;
			}
			case 'Set': {
				const set = new Set();
				this.execCount(() => set.add(this.generateByType(type.typeArguments?.[0], { ...option })), length);
				return set;
			}
			case 'Array': {
				const array: any[] = [];
				this.execCount(() => array.push(this.generateByType(type.typeArguments?.[0], { ...option })), length);
				return array;
			}
		}
	}

	private generateCustom(type?: ts.TypeNode, option: CustomMockOptions = { type: 'string' }) {
		if (!type) return null;
		switch (option.type) {
			case 'string':
				return this.verify(option.value, this.generateString(option));
			case 'number':
			case 'number_float':
				return this.verify(option.value, this.generateNumber(option));
			case 'array':
				if (type.kind === ts.SyntaxKind.TypeReference) {
					return this.verify(option.value, this.generateReference(type as ts.TypeReferenceNode, {}, option.length));
				}
				return this.verify(option.value, this.generateArray(type, option));
			default:
				break;
		}
	}

	private generateString(option: MockStringOptions) {
		const { min = BASIC_MIN_STRING, max = BASIC_MAX_STRING, language } = option;
		switch (language) {
			case 'en':
				return generate_en(min, max);
			case 'zh':
				return generate_cn(min, max);
			default:
				return generate_string(min, max);
		}
	}

	private generateNumber(option: MockNumberOptions) {
		const { min = BASIC_MIN_NUMBER, max = BASIC_MAX_NUMBER, fixed = BASIC_FIXED, type } = option;
		switch (type) {
			case 'number':
				return randomNum(min, max);
			case 'number_float':
				return randomFloatNum(min, max, fixed);
		}
	}

	private generateArray(type: ts.TypeNode, option: MockArrayOptions) {
		const arrayNode = type as ts.ArrayTypeNode;
		const { length } = option;
		const array: any[] = [];
		this.execCount(() => array.push(this.generateByType(arrayNode.elementType, {})), length);
		return array;
	}

	private verify(value: any, data: any) {
		if (typeof value === 'function' && value !== null) {
			return value(data);
		} else if (value) {
			return value;
		} else {
			return data;
		}
	}

	private execCount(callback: () => void, count: number) {
		for (let i = 0; i < count; i++) {
			callback();
		}
	}
}

export { Mock, MockOptions };

export default Mock;
