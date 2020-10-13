import Xhr from "../../src/http/xhr";
import fetchMock from "jest-fetch-mock";

describe('test src/http', () => {
    beforeEach(() => {
        // @ts-ignore
        global.fetch = fetchMock.mockIf(/^http:\/\/test\//, (req) => {
            return Promise.resolve({
                body: JSON.stringify({a: 'hello'})
            })
        })
    })

    it('test xhr class', async () => {
        expect.assertions(2)
        const xhr = new Xhr()
        expect(xhr.channel).toEqual(expect.any(String))

        await expect(xhr.post({
            url: 'http://test',
            data: {},
            credentials: 'include',
            config: {
                headers: {
                    'x-ua-i': 'test'
                }
            }
        })).resolves.toEqual({a: 'hello'})
    })
})