"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackTraceParser = exports.Cache = void 0;
class Cache {
    constructor(opts) {
        this.cache = {};
        this.ttlCache = {};
        this.onMiss = opts.miss;
        this.tllTime = opts.ttl || -1;
        if (opts.ttl) {
            this.worker = setInterval(this.workerFn.bind(this), 1000);
            this.worker.unref();
        }
    }
    workerFn() {
        let keys = Object.keys(this.ttlCache);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = this.ttlCache[key];
            if (Date.now() > value) {
                delete this.cache[key];
                delete this.ttlCache[key];
            }
        }
    }
    get(key) {
        if (!key)
            return null;
        let value = this.cache[key];
        if (value)
            return value;
        value = this.onMiss(key);
        if (value) {
            this.set(key, value);
        }
        return value;
    }
    set(key, value) {
        if (!key || !value)
            return false;
        this.cache[key] = value;
        if (this.tllTime > 0) {
            this.ttlCache[key] = Date.now() + this.tllTime;
        }
        return true;
    }
    reset() {
        this.cache = {};
        this.ttlCache = {};
    }
}
exports.Cache = Cache;
class StackTraceParser {
    constructor(options) {
        this.contextSize = 3;
        this.cache = options.cache;
        this.contextSize = options.contextSize;
    }
    isAbsolute(path) {
        if (process.platform === 'win32') {
            let splitDeviceRe = /^([a-zA-Z]:|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)?([\\/])?([\s\S]*?)$/;
            let result = splitDeviceRe.exec(path);
            if (result === null)
                return path.charAt(0) === '/';
            let device = result[1] || '';
            let isUnc = Boolean(device && device.charAt(1) !== ':');
            return Boolean(result[2] || isUnc);
        }
        else {
            return path.charAt(0) === '/';
        }
    }
    parse(stack) {
        if (stack.length === 0)
            return null;
        const userFrame = stack.find(frame => {
            const type = this.isAbsolute(frame.file_name) || frame.file_name[0] === '.' ? 'user' : 'core';
            return type !== 'core' && frame.file_name.indexOf('node_modules') < 0 && frame.file_name.indexOf('@pm2/io') < 0;
        });
        if (userFrame === undefined)
            return null;
        const context = this.cache.get(userFrame.file_name);
        const source = [];
        if (context === null || context.length === 0)
            return null;
        const preLine = userFrame.line_number - this.contextSize - 1;
        const start = preLine > 0 ? preLine : 0;
        context.slice(start, userFrame.line_number - 1).forEach(function (line) {
            source.push(line.replace(/\t/g, '  '));
        });
        if (context[userFrame.line_number - 1]) {
            source.push(context[userFrame.line_number - 1].replace(/\t/g, '  ').replace('  ', '>>'));
        }
        const postLine = userFrame.line_number + this.contextSize;
        context.slice(userFrame.line_number, postLine).forEach(function (line) {
            source.push(line.replace(/\t/g, '  '));
        });
        return {
            context: source.join('\n'),
            callsite: [userFrame.file_name, userFrame.line_number].join(':')
        };
    }
    retrieveContext(error) {
        if (error.stack === undefined)
            return null;
        const frameRegex = /(\/[^\\\n]*)/g;
        let tmp;
        let frames = [];
        while ((tmp = frameRegex.exec(error.stack))) {
            frames.push(tmp[1]);
        }
        const stackFrames = frames.map((callsite) => {
            if (callsite[callsite.length - 1] === ')') {
                callsite = callsite.substr(0, callsite.length - 1);
            }
            let location = callsite.split(':');
            return {
                file_name: location[0],
                line_number: parseInt(location[1], 10)
            };
        });
        return this.parse(stackFrames);
    }
}
exports.StackTraceParser = StackTraceParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2tQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvc3RhY2tQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBc0JBLE1BQWEsS0FBSztJQVFoQixZQUFhLElBQWtCO1FBTnZCLFVBQUssR0FBMkIsRUFBRSxDQUFBO1FBQ2xDLGFBQVEsR0FBOEIsRUFBRSxDQUFBO1FBTTlDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7UUFFN0IsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtTQUNwQjtJQUNILENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2pCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FB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