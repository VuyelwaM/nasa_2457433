getData();

async function getData() {
    const apiKey = "UqV6Y2axrvRmhVEWKg6XvqQ2uMjt6jCwKe6bdQf8";
    const year = 2021; // Replace with the year you're interested in
    const apiUrl = `https://api.nasa.gov/DONKI/GST?startDate=${year}-01-01&endDate=${year}-12-31&api_key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json(); // Parse the response as JSON
        console.log(data);

        createLineChart(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function createLineChart(data) {
    // Extract relevant information for the graph
    const processedData = data.map(event => ({
        startTime: new Date(event.startTime),
        month: event.startTime.substring(5, 7), // Extract month (MM) from startTime
        kpIndex: event.allKpIndex[0].kpIndex
    }));

    // Filter data for the selected year (2021)
    const year = 2021;
    const yearData = processedData.filter(d => d.startTime.getFullYear() === year);

    // Create an array to store the total kpIndex for each month
    const monthlyAverages = Array.from({ length: 12 }, () => 0);
    const monthlyCounts = Array.from({ length: 12 }, () => 0);

    yearData.forEach(d => {
        const monthIndex = parseInt(d.month) - 1; // Adjust month index (0-based)
        monthlyAverages[monthIndex] += d.kpIndex;
        monthlyCounts[monthIndex]++;
    });

    // Calculate average kpIndex for each month
    for (let i = 0; i < monthlyAverages.length; i++) {
        if (monthlyCounts[i] > 0) {
            monthlyAverages[i] /= monthlyCounts[i];
        }
    }

    // Set Dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append SVG Object to the Page
    const svg = d3.select("#myPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X Axis
    const x = d3.scaleBand()
        .domain([...Array(12).keys()])
        .range([0, width])
        .padding(0.1);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(monthIndex => d3.timeFormat("%b")(new Date(0, monthIndex))));

    // Y Axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(monthlyAverages)])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Line
    const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d));

    svg.append("path")
        .datum(monthlyAverages)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
}