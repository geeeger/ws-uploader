export type MockFile = (name: string, size: number, mimeType: string) => File

declare global {
    var MockFile: MockFile
    namespace NodeJS {
        interface Global {
            MockFile: MockFile;
        }
    }
}


