import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Reprova quando o campo decorado e o campo `property` vem preenchidos juntos.
 *
 * Existe por causa de uma pegadinha do `@ValidateIf`: um par de campos
 * mutuamente exclusivos escrito como `@ValidateIf(dto => !dto.b)` em `a` e
 * `@ValidateIf(dto => !dto.a)` em `b` **desliga as duas condicoes quando os
 * dois vem juntos** -- nenhum dos dois e validado e um valor invalido passa
 * inteiro pelo `ValidationPipe`. Este decorator fecha esse lado; o
 * `@ValidateIf` de cada campo continua garantindo que pelo menos um veio.
 *
 * Precisa ficar num campo cujo `@ValidateIf` seja verdadeiro quando o proprio
 * campo esta presente -- senao ele tambem e pulado junto com o resto.
 */
export function NotTogetherWith(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'notTogetherWith',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [otherProperty] = args.constraints as [string];
          const otherValue = (args.object as Record<string, unknown>)[otherProperty];
          return value === undefined || otherValue === undefined;
        },
        defaultMessage(args: ValidationArguments): string {
          const [otherProperty] = args.constraints as [string];
          return `${args.property} and ${otherProperty} cannot be sent together`;
        },
      },
    });
  };
}
