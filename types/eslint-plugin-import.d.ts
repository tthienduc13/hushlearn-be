declare module "eslint-plugin-import" {
  import type { ClassicConfig, Linter } from "@typescript-eslint/utils/ts-eslint";

  const exprt: {
    configs: {
      recommended: ClassicConfig.Config;
      errors: ClassicConfig.Config;
      warnings: ClassicConfig.Config;
      "stage-0": ClassicConfig.Config;
      react: ClassicConfig.Config;
      "react-native": ClassicConfig.Config;
      electron: ClassicConfig.Config;
      typescript: ClassicConfig.Config;
    };
    rules: NonNullable<Linter.Plugin["rules"]>;
    flatConfigs: {
      recommended: Record<string, any>;
      errors: Record<string, any>;
      warnings: Record<string, any>;
      typescript: Record<string, any>;
      react: Record<string, any>;
    };
  };
  export default exprt;
}
