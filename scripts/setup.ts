import "./setup.d"
if (!global.MockFile) {
    global.MockFile = function MockFile (name: string, size: number, mimeType: string): File {
        name = name || "mock.txt";
        size = size || 1024;
        mimeType = mimeType || 'plain/txt';
    
        function range(count: number) {
            var output = "";
            for (var i = 0; i < count; i++) {
                output += "a";
            }
            return output;
        }
    
        var blob = new Blob([range(size)], { type: mimeType });
        // @ts-ignore
        blob.lastModifiedDate = new Date();
        // @ts-ignore
        blob.name = name;
    
        return blob as File;
    };
}