const messages: Record<string, string> = {
  "Invalid email or password": "E-mail ou senha inválidos.",
  "Invalid email": "Informe um e-mail válido.",
  "Invalid password": "Senha inválida.",
  "Password too short": "A senha precisa ter pelo menos 8 caracteres.",
  "Password too long": "A senha passou do limite de caracteres.",
  "User already exists.": "Já existe uma conta com esse e-mail.",
  "User already exists. Use another email.":
    "Já existe uma conta com esse e-mail.",
  "Failed to create user": "Não foi possível criar a conta.",
  "Failed to create session": "Não foi possível iniciar a sessão.",
};

export function authErrorMessage(message?: string) {
  if (!message) return "Não foi possível concluir. Tente de novo.";
  return messages[message] ?? "Não foi possível concluir. Tente de novo.";
}
