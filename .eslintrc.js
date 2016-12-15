module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jquery": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "warn",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        //NOTE: disallow console before prodution 
        "no-console":0,
        "no-undefined": 0,
        "no-unused-vars": [1, {"vars": "local", "args": "none"}],
        "semi": [
            "error",
            "always"
        ]
    }
};