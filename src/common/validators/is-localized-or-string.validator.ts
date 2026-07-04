import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/** Accepts either a plain string or a { de, ar } localized object. */
export function IsLocalizedOrString(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isLocalizedOrString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value === 'string') return true;
          if (value && typeof value === 'object') {
            const localized = value as Record<string, unknown>;
            return (
              typeof localized.de === 'string' &&
              typeof localized.ar === 'string'
            );
          }
          return false;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a string or a { de, ar } object`;
        },
      },
    });
  };
}
