import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, ButtonGroup } from '@mui/material';
import { createChart } from 'lightweight-charts';
import { blueGrey, green, grey, lightBlue, red } from '@mui/material/colors';

const StockChart = ({ data, companyName, exchangeCode, ticker, price, marketPriceChange }) => {
  const chartContainerRef = useRef(null);
  const [chartType, setChartType] = useState('line'); // 'line' or 'candlestick'

  const convertUnixTo12HourTime = (unixTime) => {
    const date = new Date(unixTime * 1000); // Convert to ms
    let hours = date.getHours();
    let minutes = date.getMinutes();
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; // handle 0
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    return `${hours}:${minutes} ${ampm}`;
  }  
  

  useEffect(() => {
    if (!data || data.length === 0) return;

    const isStockUp = data[0]?.close < data[data.length - 1]?.close;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: 'black' },
        textColor: 'white',
      },
      grid: {
        vertLines: { color: grey[900] },
        horzLines: { color: grey[900] },
      },
      priceScale: {
        borderColor: '#71649C',
        minBarSpacing: 0.1,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#71649C',
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          let hours = date.getHours();
          let minutes = date.getMinutes();
    
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          minutes = minutes < 10 ? '0' + minutes : minutes;
    
          return `${hours}:${minutes} ${ampm}`;
        },
        minBarSpacing: 2,
      },
    });
    
    

    const series =
      chartType === 'line'
        ? chart.addLineSeries({
            color: isStockUp ? '#4caf50' : '#f44336', // Green if up, Red if down
            lineWidth: 2,
          })
        : chart.addCandlestickSeries();

    const formattedData = data?.map(item => ({
        time: Math.floor(new Date(item.date).getTime() / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        value: item.close, // for line chart
      }))
      .sort((a, b) => a.time - b.time);

    series.setData(formattedData);

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, chartType]);

  return (
    <Card
      sx={{
        background: 'black',
        border: `0.5px solid ${grey[900]}`,
        p: 0,
        mt: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1} sx={{ borderRadius: 0}}>
        <Box display="block" gap={1}>
          <Typography variant="body1" fontSize="12pt" fontWeight="" color="white">
            { companyName || null }
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="white">
            { price || null }
          </Typography>
          <Typography variant="body2" color={`${marketPriceChange.startsWith("-") ? red[700] : green[700]}`}>
            { marketPriceChange || null }
          </Typography>
        </Box>

        <ButtonGroup variant="outlined" size="small" sx={{ borderColor: 'white' }}>
          <Button
            onClick={() => setChartType('line')}
            sx={{ color: blueGrey[100] , borderColor: blueGrey[900] }}
          >
            Line
          </Button>
          <Button
            onClick={() => setChartType('candlestick')}
            sx={{ color: blueGrey[100] , borderColor: blueGrey[900] }}
          >
            Candlestick
          </Button>
        </ButtonGroup>
      </Box>

      <CardContent sx={{ p: 0 }}>
        <div
          ref={chartContainerRef}
          style={{ width: '100%', backgroundColor: '#000000' }}
        />
      </CardContent>
    </Card>
  );
};

export default StockChart;