export default [
	{
		extends: ["eslint:recommended", "prettier"],
		env: {
			es2022: true,
			node: true,
		},
		languageOptions: {
			sourceType: "module",
		},
		rules: {
			indent: ["error", "tab"],
			semi: ["error", "always"],
			quotes: ["error", "double"],
			yoda: ["error", "never", { exceptRange: true }],
			"linebreak-style": ["error", "unix"],
			"operator-linebreak": ["error", "before"],
			"comma-dangle": ["error", "always-multiline"],
			"dot-location": ["error", "property"],
			"no-array-constructor": "error",
			"no-floating-decimal": "error",
			"no-return-assign": "error",
			"no-self-compare": "error",
		},
	},
];
