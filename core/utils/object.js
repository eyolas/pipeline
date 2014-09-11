exports.clone = function clone(obj) {
	 if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}


exports.orderObjectByKey = function orderObjectByKey(obj) {
	if (!obj) return "";
	var keys = Object.keys(obj),
    i, len = keys.length;

	keys.sort();
	var newObj = {};
	for (i = 0; i < len; i++){
	    k = keys[i];
	    newObj[k] = obj[k];
	}
	return newObj;
}