import { loadEnv } from "./env";
import { helloGemini } from "./provider";

const main = async () => {
  loadEnv();

  try {
    const result = await helloGemini();
    console.log("%c [qq]: result", "background: #fbff00;", "\n", result, "\n");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.log(
      "%c [qq]: message",
      "background: #fbff00;",
      "\n",
      message,
      "\n",
    );
  }
};

main();
