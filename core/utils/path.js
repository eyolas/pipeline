var isWindows = process.platform === 'win32';

if (isWindows) {
	// tail] windows-only
  	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

	exports.isAbsolute = function(path) {
		var result = splitDeviceRe.exec(path),
			device = result[1] || '',
			isUnc = device && device.charAt(1) !== ':';
		// UNC paths are always absolute
		return !!result[2] || isUnc;
	};
} else {
	// posix version
 	exports.isAbsolute = function(path) {
    	return path.charAt(0) === '/';
  	};
}