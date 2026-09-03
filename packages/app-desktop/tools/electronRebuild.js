const execCommand = require('./execCommand');

const isArm64 = () => {
	return process.platform === 'arm64';
};

const isWindows = () => {
	return process && process.platform === 'win32';
};

// 是否为 Windows ARM64 架构
const isNativeWindowsArm64 = () => {
	if (!isWindows()) return false;
	// 当 x64 Node 在 WoA (Windows on ARM) 上运行时，环境变量会暴露真实的原生架构
	const rawArch = process.env.PROCESSOR_ARCHITEW6432 || process.env.PROCESSOR_ARCHITECTURE;
	return process.arch === 'arm64' || rawArch === 'ARM64';
};

// 是否为 Windows x64 (64位 Intel/AMD) 架构
const isWindowsX64 = () => {
	return isWindows() && process.arch === 'x64';
};

async function main() {
	// electron-rebuild --arch ia32 && electron-rebuild --arch x64

	// console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	// console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ELECTRON REBUILD IS DISABLED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	// console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
	// return;

	// let exePath = `${__dirname}/../node_modules/.bin/electron-rebuild`;
	// if (isWindows()) exePath += '.cmd';

	process.chdir(`${__dirname}/..`);

	// We need to force the ABI because Electron Builder or node-abi picks the
	// wrong one. However it means it will have to be manually upgraded for each
	// new Electron release. Some ABI map there:
	// https://github.com/electron/node-abi/blob/main/abi_registry.json
	const forceAbiArgs = '--force-abi 143';

	if (isNativeWindowsArm64()) {
    // Windows ARM64 专属逻辑
   		console.info(await execCommand(['yarn', 'run', 'electron-rebuild', forceAbiArgs, '--arch=arm64'].join(' ')));
	} else if (isWindowsX64()) {
	    // Windows x64 / ia32 逻辑
	    console.info(await execCommand(['yarn', 'run', 'electron-rebuild', forceAbiArgs, '--arch x64'].join(' ')));
	} else if (isArm64()) {
		// Keytar needs it's own electron-rebuild or else it will not fetch the
		// existing prebuilt binary, this will cause cross-compilation to fail.
		// E.g. for MacOS arm64 it will download:
		// https://github.com/atom/node-keytar/releases/download/v7.9.0/keytar-v7.9.0-napi-v3-darwin-arm64.tar.gz
		console.info(await execCommand(['yarn', 'run', 'electron-rebuild', forceAbiArgs, '--arch=arm64', '--only=keytar'].join(' ')));
		//console.info(await execCommand(['yarn', 'run', 'electron-rebuild', forceAbiArgs].join(' ')));
	} else {
		console.info(await execCommand(['yarn', 'run', 'electron-rebuild', forceAbiArgs].join(' ')));
	}
}

module.exports = main;
