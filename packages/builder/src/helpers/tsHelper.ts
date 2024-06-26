import { neverReachHere } from '../utils/neverReachHere';
import { Class } from '../models/Class';
import type { Type } from '../models/Type';
import {
  isJavaBoolean,
  isJavaList,
  isJavaLong,
  isJavaMap,
  isJavaNumber,
  isJavaString,
  isJavaTuple,
  isJavaUnknown,
  isJavaVoid,
  isJavaWrapper,
} from './javaHelper';
import { toLowerCamel } from '../utils';
import { RootOptions } from 'src/models/RootOptions';

// Convert value to safe string in code
export const ss = (u: string | number | boolean) => {
  if (typeof u === 'string') {
    return `'${String(u).replace(/['\\\r\n]/g, (char) => {
      const code = char.charCodeAt(0);
      return code < 0x10 ? `\\x0${code.toString(16)}` : `\\x${code.toString(16)}`;
    })}'`;
  }
  if (typeof u === 'number') {
    return String(u);
  }
  if (typeof u === 'boolean') {
    return String(u);
  }
  throw neverReachHere(u);
};

export const t2s = (type: Type): string => {
  if (!type) return 'unknown';
  const { name, parameters, isGenericVariable, builder } = type;

  if (isGenericVariable) return name;

  switch (name) {
    case 'java.math.BigDecimal':
      builder.commonDefs.BigDecimal = 'string | number';
      return 'BigDecimal';
    case 'java.math.BigInteger':
      builder.commonDefs.BigInteger = 'string | number';
      return 'BigInteger';
    case 'org.springframework.web.multipart.MultipartFile':
      builder.commonDefs.MultipartFile = 'Blob | File | string';
      return 'MultipartFile';
    default:
  }
  if (isJavaLong(name)) {
    builder.commonDefs.Long = 'string | number';
    return 'Long';
  }
  if (isJavaNumber(name)) return 'number';
  if (isJavaString(name)) return 'string';
  if (isJavaBoolean(name)) return 'boolean';
  if (isJavaVoid(name)) return 'void';
  if (isJavaMap(name)) {
    const [first, second] = parameters;
    let keyType;
    if (first && (isJavaString(first.name) || isJavaNumber(first.name) || first.isEnum)) {
      keyType = t2s(first);
    } else {
      keyType = 'PropertyKey';
    }
    return `Record<${keyType}, ${t2s(second)}>`;
  }
  if (isJavaList(name)) {
    return `${t2s(parameters[0])}[]`;
  }
  if (isJavaWrapper(name)) {
    const [first] = parameters;
    if (first) {
      builder.commonDefs['Optional<T>'] = 'T | null';
      return `Optional<${t2s(first)}>`;
    } else {
      return 'unknown';
    }
  }
  if (isJavaTuple(name)) {
    return `[ ${parameters.map(t2s).join(', ')} ]`;
  }
  if (isJavaUnknown(name)) return 'unknown';

  const { clz } = type;
  if (!clz) return 'unknown';

  const { simpleName: simpleName } = clz;
  if (clz instanceof Class) {
    const { typeParameters } = clz;
    if (typeParameters.length > 0) {
      const pars = typeParameters.map((_, i) => t2s(parameters[i])).join(', ');
      return `${simpleName}<${pars}>`;
    }
  }
  return simpleName;
};

export const tsBuilderOptions: Partial<RootOptions> = {
  uniqueNameSeparator: '$',
  fixModuleName: (s) => toLowerCamel(s) || 'unknownModule',
};
