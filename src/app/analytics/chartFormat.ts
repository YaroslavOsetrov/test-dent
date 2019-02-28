export class LinearChart{
    static options = {
        legend: 'none',
        areaOpacity: 0.18,
        tooltip: {trigger: 'selection'},
        series:null,
        seriesType:null,
        hAxis: {
            textStyle: {
                color: '#ccc',
                fontName: 'Muller, sans-serif',
                fontSize: 11
            },
            gridlines: 'null'
        },
        vAxis: {
            title: 'title',
            slantedText: true,
            slantedTextAngle: 90,
            minValue: 0,
            textStyle: {
                color: '#ccc',
                fontName: 'Muller, sans-serif',
                fontSize: 11
            },
            format:null,
            titleTextStyle: {
                color: '#343434',
                fontName: 'Muller, sans-serif',
                fontSize: 14,
                italic: false
            },
         //   format:'decimal',
            baselineColor: '#274abb',
            gridlines: {
                color: '#ebf0f3',
                count: 7
            },
            viewWindow:{ min: 0 }
        },
        lineWidth: 2,
        colors: ['#274abb'],
        curveType: 'function',
        pointSize: 2,
        pointShapeType: 'circle',
        pointFillColor: '#f00',
        backgroundColor: {
            fill: '#fff',
            strokeWidth: 0
        },
        chartArea: {
            left: '10%',
            top: 5,
            width: '80%',
            height: 150
        }
    }

    
}

export class PieChart {

    static  options = {
        legend: 'none',
        pieSliceText: 'none',
        chartArea: {
            width: '90%',
            height: 150,
        },
        colors: ['#46c35f', '#fa424a', '#e84f9a', '#fdad2a', '#00a8ff', '#ac6bec'],
        slices: {
            0: {color: '#46c35f'},
            1: {color: '#fa424a'},
            2: {color: '#ac6bec'},
            3: {color: '#fdad2a'},
            4: {color: '#00a8ff'}
        },
        pieHole: 0.8,
        tooltip: {trigger: 'none'}
    };
}