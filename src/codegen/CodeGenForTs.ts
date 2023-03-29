import { CodeGen } from './CodeGen';
import { ss, t2s } from '../helpers/tsHelper';
import type { Root } from '../models/Root';
import type { Route } from '../models/Route';

interface Options {
  base: string;
  /**
   * @default false;
   */
  noHead?: boolean;
  /**
   * @default "@huolala-tech/nad-runtime"
   */
  runtimePkgName?: string;
}

export class CodeGenForTs extends CodeGen {
  private readonly root;
  private readonly options;

  constructor(root: Root, options: Options) {
    super();
    this.root = root;
    this.options = options;
    if (!options.noHead) {
      this.write('/* 该文件由 Nad CLI 生成，请勿手改 */');
      this.write('/* This file is generated by Nad CLI, do not edit manually. */');
      this.write('/* eslint-disable */');
      this.write('');
    }
    const runtimePkgName = options.runtimePkgName || '@huolala-tech/nad-runtime';
    this.write(`import { NadInvoker } from '${runtimePkgName}';`);
    this.write(`import type { Settings } from '${runtimePkgName}';`);
    this.write('');
    const { base } = this.options;
    this.write(`const BASE = ${ss(base)};`);
    this.write('');
    this.writeModules();
    this.writeClasses();
    this.writeEnums();
    this.writeCommonDefs();
  }

  /**
   * TS does not allow a required parameter follow an optional parameter, see https://typescript.tv/errors/#TS1016
   * SOLUTION 1: Sort the parameter list, making all required parameters be advanced.
   * This solution breaks uniformity with Java definitions and may lead to confusion among some developers, making it an unfavorable option.
   * SOLUTION 2: Find the last required parameters, make all optional parameters to left of it required, and change their type to `T | null`.
   * Use the SOLUTION 2 here.
   */
  private getPars(a: Route) {
    let hasRequired = false;
    const pars = a.parameters
      .slice(0)
      .reverse()
      .map((p) => {
        if (hasRequired && p.required === '?') return `${p.name}: ${t2s(p.type)} | null`;
        hasRequired = hasRequired || p.required === '';
        return `${p.name}${p.required}: ${t2s(p.type)}`;
      })
      .reverse();
    pars.push('settings?: Partial<Settings>');
    return pars;
  }

  private writeApi(a: Route) {
    const pars = this.getPars(a);
    this.writeComment(() => {
      this.write(a.description || a.name);
      for (const p of a.parameters) {
        if (p.description) this.write(`@param ${p.name} ${p.description}`);
      }
    });
    this.write(`async ${a.uniqName}(${pars.join(', ')}) {`);
    this.writeBlock(() => {
      this.write(`return new NadInvoker<${t2s(a.returnType)}>(BASE)`);
      this.writeBlock(() => {
        this.write(`.open(${ss(a.method)}, ${ss(a.pattern)}, settings)`);
        if (a.requestContentType) {
          this.write(`.addHeader(${ss('Content-Type')}, ${ss(a.requestContentType)})`);
        }
        for (const p of a.parameters) {
          for (const [m, ...args] of p.actions) {
            if (args.length) {
              this.write(`.${m}(${args.map(ss).join(', ')}, ${p.name})`);
            } else {
              this.write(`.${m}(${p.name})`);
            }
          }
        }
        this.write(`.execute();`);
      });
    });
    this.write('},');
  }

  private writeModules() {
    for (const m of this.root.modules) {
      this.writeComment(() => {
        this.write(m.description || m.moduleName);
        this.write(`@iface ${m.name}`);
      });
      this.write(`export const ${m.moduleName} = {`);
      this.writeBlock(() => {
        for (const a of m.routes) this.writeApi(a);
      });
      this.write('};', '');
    }
  }

  private writeCommonDefs() {
    for (const [alias, tsType] of Object.entries(this.root.commonDefs)) {
      this.write(`export type ${alias} = ${tsType};`);
      this.write('');
    }
  }

  private writeEnums() {
    for (const e of this.root.enumList) {
      if (e.description) {
        this.writeComment(() => {
          this.write(e.description);
        });
      }
      this.write(`export enum ${e.simpleName} {`);
      this.writeBlock(() => {
        for (const v of e.constants) {
          if (v.description) {
            this.writeComment(() => {
              this.write(v.description);
            });
          }
          this.write(`${v.name} = ${ss(v.value)},`);
          if (v.memo) this.amend((s) => `${s} // ${v.memo}`);
        }
      });
      this.write('}');
      this.write('');
    }
  }

  private writeClasses() {
    for (const c of this.root.declarationList) {
      this.writeComment(() => {
        this.write(c.description || c.simpleName);
        this.write(`@iface ${c.name}`);
      });
      const { defName } = c;
      if (c.members.length) {
        let defStr = defName;
        if (c.superclass) {
          const type = t2s(c.superclass);
          if (type !== 'any') defStr += ` extends ${type}`;
        }
        this.write(`export interface ${defStr} {`);
        this.writeBlock(() => {
          for (const m of c.members) {
            if (m.description) {
              this.writeComment(() => {
                this.write(m.description);
              });
            }
            this.write(`${m.name}${m.optional}: ${t2s(m.type)};`);
          }
        });
        this.write('}');
      } else {
        this.write(`export type ${c.defName} = ${t2s(c.superclass)};`);
      }
      this.write('');
    }
  }
}
