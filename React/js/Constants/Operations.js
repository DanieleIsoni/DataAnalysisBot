//This is a static (can be dynamic) array of all the possible operations that helps the user during the analisys
//Will be viewed in the HELP SECTION

let operations = [
    {
        "name": "Basic Description",
        "commands": ["Basic description"],
        "description": "Descriptives tables describe the basic features of data in quantitative terms. You can choose one or more of the following statistics"
    },
    {
        "name": "Variance",
        "commands": ["var"],
        "description": "In probability theory and statistics, variance is the expectation of the squared deviation of a random variable from its mean"
    },
    {   "name": "Mean",
        "commands": ["mean", "avg", "average"],
        "description": "In probability and statistics, population mean and expected value are used synonymously to refer to one measure of the central tendency either of a probability distribution or of the random variable characterized by that distribution."
    },
    {   "name": "Bar Plot",
        "commands": ["Can you plot..."],
        "description": "A bar chart or bar graph is a chart or graph that presents categorical data with rectangular bars with heights or lengths proportional to the values that they represent. A bar graph shows comparisons among discrete categories. One axis of the chart shows the specific categories (not discrete) being compared, and the other axis represents a measured value."
    }
]

export default operations;