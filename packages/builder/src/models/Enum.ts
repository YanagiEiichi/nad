import { Dubious } from '../utils';
import { u2a } from 'u2x';
import { DefBase } from './DefBase';
import { EnumConstant } from './EnumConstant';
import { NadEnum } from '../types/nad';
import { Root } from './Root';

type EnumRaw = Dubious<NadEnum>;

export class Enum extends DefBase<EnumRaw> {
  public readonly constants;
  public readonly valueType;
  public readonly description;
  constructor(raw: EnumRaw, root: Root) {
    super(raw, root);
    this.constants = u2a(this.raw.constants, (i) => new EnumConstant(i, this));
    this.valueType = this.initValueType();
    this.description = this.annotations.swagger.getApiModel()?.description;
  }
  private initValueType() {
    // All enum values should be of the same type, either of 'string' or 'number'.
    // Otherwise, it should be regarded as 'unknown'.
    const valueTypes = Array.from(new Set(this.constants.map((i) => typeof i.rawValue)));
    let vt = valueTypes.length === 1 ? valueTypes[0] : ('unknown' as const);
    if (vt !== 'string' && vt !== 'number') vt = 'unknown' as const;
    return vt;
  }

  public spread() {
    // noop
  }
}
