import { localStorage } from "../src/lib/storage/local-storage";

const file = new File(
  ["Teste de armazenamento do IndieFlix"],
  "teste.mp4",
  { type: "video/mp4" },
);

async function main() {
  const key = await localStorage.save(file, "videos");
  console.log("Arquivo salvo:", key);

  const absolutePath = localStorage.getAbsolutePath(key);
  console.log("Caminho resolvido:", absolutePath);

  await localStorage.delete(key);
  console.log("Arquivo excluído com sucesso.");
}

main().catch((error) => {
  console.error("Falha no teste:", error);
  process.exitCode = 1;
});