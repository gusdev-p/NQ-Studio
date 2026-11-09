import { build, Platform } from "electron-builder";

await build({
	targets: Platform.LINUX.createTarget([
		"AppImage", "deb"
	]),
	config: {
		appId: "dev.gusdev.nq-studio",
		productName: "nq-studio",
		asar: true,
		buildVersion: "1.6.1",
		extraResources: [
			{
				from: "assets/logo.png",
				to: "logo.png"
			}
		],
		directories: {
			output: "release"
		},
		files: [
			"dist/**/*",
			"assets/**/*",
			"package.json"
		],
		linux: {
			maintainer: "Gusdev-p",
			icon: "assets/logo.png",
			executableName: "nq-studio",
			synopsis: "A lightweight IDE for Node.JS projects.",
			description: "A lightweight IDE for JavaScript, TypeScript, HTML, CSS and Node.JS projects :0",
			vendor: "gusdev-willpower",
			artifactName: "${productName}-${version}_${arch}.${ext}",
			category: "Development;IDE;TextEditor",
			desktop: {
				entry: {
					Icon: "/opt/nq-studio/resources/logo.png",
					Name: "NQ-Studio"
				}
			}
		}
	}
});