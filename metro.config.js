const { getDefaultConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
	...defaultConfig,
	transformer: {
		...(defaultConfig.transformer || {}),
		unstable_allowRequireContext: true,
	},
	server: {
		port: 8082,
	},
};
