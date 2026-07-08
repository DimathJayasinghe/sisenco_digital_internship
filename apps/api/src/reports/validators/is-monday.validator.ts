import { registerDecorator, ValidationOptions } from 'class-validator';

const MONDAY = 1;

/**
 * Requires an ISO date string to fall on a Monday. Reports must start their
 * week on a consistent weekday so the whole team's weeks align to the same
 * calendar grid — otherwise the dashboard's "current week" compliance metric
 * has no single boundary to count members against.
 */
export function IsMonday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isMonday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          const date = new Date(value);
          return !Number.isNaN(date.getTime()) && date.getUTCDay() === MONDAY;
        },
        defaultMessage(): string {
          return 'weekStartDate must be a Monday';
        },
      },
    });
  };
}
