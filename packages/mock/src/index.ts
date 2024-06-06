import * as ts from 'typescript';
import { generate_string } from './string';
import { randomNum } from './number';
import { MAX_REFERENCE } from './const';

type Node = ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration | ts.ModuleDeclaration;

interface MockOptions {
	$$pre_type?: string;
	$$reference?: number;
	[key: string]: any;
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
						const value = this.generateByType(member.type, { ...option });
						obj[key] = value;
					}
				});
				return obj;
			case ts.SyntaxKind.EnumDeclaration: {
				const enumDeclaration = node as ts.EnumDeclaration;
				const enumMenber = enumDeclaration.members[randomNum(0, enumDeclaration.members.length - 1)];
				let value = enumMenber.name.getText();
				value = enumMenber.initializer?.getText() || value;
				return value;
			}
			default:
				return {};
		}
	}

	private generateBasic(type?: ts.TypeNode, option: MockOptions = {}) {
		if (!type) return null;
		switch (type.kind) {
			case ts.SyntaxKind.StringKeyword:
				return generate_string(5, 10);
			case ts.SyntaxKind.NumberKeyword:
				return randomNum(5, 10);
			case ts.SyntaxKind.TypeReference:
				return this.generateReference(type as ts.TypeReferenceNode, { ...option });
			default:
				return null;
		}
	}

	private generateByType(type?: ts.TypeNode, option: MockOptions = {}) {
		if (!type) return null;
		if (option.$$reference && option.$$reference >= MAX_REFERENCE) return;
		if (type.getText() === option.$$pre_type) option.$$reference = option.$$reference ? option.$$reference + 1 : 1;
		if (this.map.has(type.getText())) {
			return this.generate(type.getText(), { ...option });
		} else {
			return this.generateBasic(type, { ...option });
		}
	}

	private generateReference(type: ts.TypeReferenceNode, option: MockOptions = {}) {
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
					this.execCount(
						() =>
							map.set(
								this.generateByType(type.typeArguments?.[0], { ...option }),
								this.generateByType(type.typeArguments?.[1], { ...option })
							),
						10
					);
				}

				return map;
			}
			case 'Set': {
				const set = new Set();
				this.execCount(() => set.add(this.generateByType(type.typeArguments?.[0], { ...option })), 10);
				return set;
			}
		}
	}

	private execCount(callback: () => void, count: number) {
		for (let i = 0; i < count; i++) {
			callback();
		}
	}
}

export { Mock };

export default Mock;
