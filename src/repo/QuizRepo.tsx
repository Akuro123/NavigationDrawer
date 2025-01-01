const serverUrl = 'https://tgryl.pl';

type ResultData = {
  
    [key: string]: any;
};

type TestDetails = {
    
    [key: string]: any;
};

class QuizRepo {
    async getResults(): Promise<any | undefined> {
        try {
            const response = await fetch(`${serverUrl}/quiz/results?last=20`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async sendResults(data: ResultData): Promise<any | undefined> {
        try {
            const response = await fetch(`${serverUrl}/quiz/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const json = await response.json();
            console.log('Successful');
            return json;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async getAllTests(): Promise<any | undefined> {
        try {
            const response = await fetch(`${serverUrl}/quiz/tests`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async getTestDetails(id: string): Promise<TestDetails | undefined> {
        try {
            const response = await fetch(`${serverUrl}/quiz/test/${id}`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
    saveResults(data:any) {
        return fetch(`${serverUrl}/quiz/result`, {
            method: 'POST',
            body: JSON.stringify(data),
        }).then((response) => response.json())
            .then((json) => {
                console.log('Succesfull');
                return json;
            }).catch((error) => {
                console.error(error);
            });
    }
}
export default new QuizRepo();
