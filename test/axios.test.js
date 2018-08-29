var axios =  require('../React/js/Actions/Axios');

describe('#SendMessage using promises', () => {
    it('should send the message', () => {
      return axios.sendMessage("hi", "NL")
      .then(data => {
        expect(data).toBeDefined()
        expect(data.status).toEqual(200)
      }).catch(data => {
          expect(data).toBeDefined()
      })
    });

    it('should get nothing', () => {
        return axios.sendMessage("", "NL")
        .then(data => {
          expect(data).toBeDefined()
          expect(data.data.message).toEqual("You haven't sent anything, what should I do?")
        }).catch(data => {
            expect(data).toBeDefined()
        })
    });

    it('should send python', () => {
        return axios.sendMessage("import something", "Py")
        .then(data => {
          expect(data).toBeDefined()
          expect(data).toEqual(200)
        }).catch(data => {
            expect(data).toBeDefined()
        })
    });

    it('should start', () => {
        return axios.sendMessage("/start", "NL")
        .then(data => {
          expect(data).toBeDefined()
          expect(data.data.message).toEqual("Hello! I'm your assistant for data analysis. Send me your .csv file with the data you want to analyse.")
        }).catch(data => {
            expect(data).toBeDefined()
        })
    });
});

describe("#getAll using promises", () => {
    it('should get all the sessions data. Empty at the start', () => {
        return axios.getAll()
        .then(response => {
            expect(response.data.messages.length).toBeGreaterThanOrEqual(0)
        })
    })
})

