export const MAX_TOKEN_ATTEMPTS = 5;

/**
 * Piso de tempo de resposta das rotas publicas que ramificam por "esse e-mail
 * tem conta?" (`POST /reset-password/request` e `POST /signup`).
 *
 * Corpo e status ja sao identicos nos dois ramos, mas o ramo com conta faz
 * duas escritas a mais (revogar tokens antigos + criar o novo) e isso, medido,
 * separava as distribuicoes quase por completo -- no `/request`, 98% das
 * amostras sem conta ficavam abaixo do minimo das com conta; no `/signup`,
 * onde o bcrypt ja levanta o piso, 95%. Uma requisicao so bastava para
 * classificar o endereco.
 *
 * 150ms fica com folga acima do pior caso medido dos dois ramos lentos
 * (~8ms no `/request`, ~27ms no `/signup`), e e imperceptivel para quem so
 * quer receber um e-mail com um codigo.
 */
export const AUTH_EMAIL_BRANCH_MIN_RESPONSE_MS = 150;
