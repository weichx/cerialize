
export function NoOp(str : string) : string {
  return str;
}

//regexes
const STRING_CAMELIZE_REGEXP = (/(-|_|\.|\s)+(.)?/g);
const STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);
const STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
const STRING_UNDERSCORE_REGEXP_2 = (/-|\s+/g);
const STRING_DASHERIZE_REGEXP = (/([a-z\d])([A-Z])/g);

//convert strings like my_camel_string to myCamelString
export function CamelCase(str : string) : string {
  return str.replace(STRING_CAMELIZE_REGEXP, function (match, separator, chr) : string {
    return chr ? chr.toUpperCase() : '';
  }).replace(/^([A-Z])/, function (match, separator, chr) : string {
    return match.toLowerCase();
  });
}

//convert strings like MyCamelString to my_camel_string
export function SnakeCase(str : string) : string {
  return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
}

//convert strings like myCamelCase to my_camel_case
export function UnderscoreCase(str : string) : string {
  return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
}

//convert strings like my_camelCase to my-camel-case
export function DashCase(str : string) : string {
  str = str.replace(/_/g, '-');
  return str.replace(STRING_DASHERIZE_REGEXP, '$1-$2').toLowerCase();
}