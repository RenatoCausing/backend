// src/pages/SPDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Dashboard from '../components/Dashboard';
import Navbar from '../components/AdviserNavbar';
import '../styles/SPDashboard.css'
import { Bar, Pie, Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  eachYearOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  min as dateFnsMin,
  max as dateFnsMax,
  isValid, // Added isValid to check date validity
} from 'date-fns';

// Corrected import for the box plot plugin components
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';

// Register Chart.js components and the box plot plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  BoxPlotController,
  BoxAndWiskers
);

// Define your backend URL
const BACKEND_URL = 'http://localhost:8080';

const SPDashboard = () => {
  const [allSps, setAllSps] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');

  const [timeGranularity, setTimeGranularity] = useState('year');
  const [dateTypeFilter, setDateTypeFilter] = useState('published');

  const [availableYears, setAvailableYears] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);


  useEffect(() => {
    if (dateTypeFilter === 'written' && timeGranularity !== 'year') {
      setTimeGranularity('year'); // Force year for 'written' type
    }
  }, [dateTypeFilter, timeGranularity]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const spResponse = await axios.get(`${BACKEND_URL}/api/sp`);
        const spData = spResponse.data;

        const processedSpData = spData.map(sp => ({
          ...sp,
          // Convert dateIssued to a Date object, check validity
          dateIssued: (sp.dateIssued && !isNaN(new Date(sp.dateIssued))) ? new Date(sp.dateIssued) : null,
        }));
        setAllSps(processedSpData);

        const tagsResponse = await axios.get(`${BACKEND_URL}/api/tags`);
        setAllTags(tagsResponse.data);

        const years = [...new Set(processedSpData.map(sp => sp.year).filter(Boolean))].sort((a, b) => b - a);
        setAvailableYears(['All', ...years]);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedYear !== 'All') {
      const semesterOrder = ['First Semester', 'Second Semester', 'Summer'];
      const semestersInYear = [...new Set(allSps.filter(sp => sp.year === parseInt(selectedYear)).map(sp => sp.semester).filter(Boolean))];
      setAvailableSemesters(['All', ...semesterOrder.filter(sem => semestersInYear.includes(sem))]);
    } else {
      setAvailableSemesters([]);
    }
  }, [selectedYear, allSps]);

  const getTagName = (tagId) => {
    const tag = allTags.find(t => t.tagId === tagId);
    return tag ? tag.tagName : `Unknown Tag (${tagId})`;
  };

  const projectsOverTimeData = () => {
    const counts = {};
    let labels = []; // This will hold our generated full range of labels
    let data = []; // This will hold the counts for each label

    if (dateTypeFilter === 'published') {
      const validDates = allSps
        .filter(sp => sp.dateIssued && isValid(sp.dateIssued))
        .map(sp => sp.dateIssued);

      if (validDates.length === 0) {
        return { labels: [], datasets: [{ label: '', data: [] }] };
      }

      const minDate = dateFnsMin(validDates);
      const maxDate = dateFnsMax(validDates);

      // 1. Populate counts from actual data
      validDates.forEach(date => {
        let key;
        if (timeGranularity === 'year') {
          key = format(date, 'yyyy');
        } else if (timeGranularity === 'month') {
          key = format(date, 'yyyy-MM');
        } else if (timeGranularity === 'week') {
          key = format(date, 'yyyy-ww'); // 'ww' is week of year (1-53)
        }
        counts[key] = (counts[key] || 0) + 1;
      });

      // 2. Generate a continuous range of labels
      if (timeGranularity === 'year') {
        labels = eachYearOfInterval({ start: minDate, end: maxDate }).map(d => format(d, 'yyyy'));
      } else if (timeGranularity === 'month') {
        // Generate months from the start of the first year to the end of the last year
        labels = eachMonthOfInterval({ start: startOfYear(minDate), end: endOfYear(maxDate) }).map(d => format(d, 'yyyy-MM'));
      } else if (timeGranularity === 'week') {
        // Generate weeks from the start of the first year to the end of the last year
        // weekStartsOn: 0 for Sunday, 1 for Monday (default for date-fns is Sunday)
        labels = eachWeekOfInterval({ start: startOfYear(minDate), end: endOfYear(maxDate) }, { weekStartsOn: 0 }).map(d => format(d, 'yyyy-ww'));
      }

      // 3. Map actual counts to the full range of labels, filling 0 for missing data
      data = labels.map(labelKey => counts[labelKey] || 0);

      // 4. Format labels for display (if not handled by TimeScale)
      let displayLabels;
      if (timeGranularity === 'year') {
        displayLabels = labels; // For year, the 'yyyy' string is fine
      } else if (timeGranularity === 'month') {
        displayLabels = labels.map(key => format(new Date(key), 'MMM yyyy')); // e.g., "Jan 2012"
      } else if (timeGranularity === 'week') {
        displayLabels = labels.map(key => {
          // Reconstruct a date from 'yyyy-ww' for display. This can be tricky.
          // A simple approach is to use the start of the week.
          const [yearStr, weekStr] = key.split('-');
          const year = parseInt(yearStr);
          const weekNum = parseInt(weekStr);

          // Calculate approximate date for the start of the week
          // This is a common way to get a date from week number
          const firstDayOfYear = new Date(year, 0, 1);
          const days = (weekNum - 1) * 7;
          const weekStartDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days));

          return `W${weekNum} ${format(weekStartDate, 'yyyy')}`; // e.g., "W01 2012"
        });
      }
      labels = displayLabels; // Use the formatted labels for the chart
    } else if (dateTypeFilter === 'written') {
      // For 'written' projects, aggregate by year attribute
      allSps.filter(sp => sp.year).forEach(sp => {
        const key = String(sp.year);
        counts[key] = (counts[key] || 0) + 1;
      });

      const yearsPresent = [...new Set(allSps.map(sp => sp.year).filter(Boolean))].sort((a, b) => a - b);
      if (yearsPresent.length === 0) {
        return { labels: [], datasets: [{ label: '', data: [] }] };
      }

      const minYear = yearsPresent[0];
      const maxYear = yearsPresent[yearsPresent.length - 1];

      for (let y = minYear; y <= maxYear; y++) {
        labels.push(String(y));
      }
      data = labels.map(labelKey => counts[labelKey] || 0);
    }


    return {
      labels: labels,
      datasets: [
        {
          label: `Number of Projects ${dateTypeFilter === 'published' ? 'Published' : 'Written'}`,
          data: data,
          fill: false,
          borderColor: 'rgb(128, 0, 0)', // Maroon
          tension: 0.1,
          pointBackgroundColor: 'rgb(128, 0, 0)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(128, 0, 0)',
        },
      ],
    };
  };

  const projectsOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Projects ${dateTypeFilter === 'published' ? 'Published' : 'Written'} Per ${dateTypeFilter === 'published' ? (timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)) : 'Year'}`,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        // Use 'time' type ONLY when dateTypeFilter is 'published' and granularity is month or week
        type: (dateTypeFilter === 'published' && (timeGranularity === 'month' || timeGranularity === 'week')) ? 'time' : 'category',
        time: (dateTypeFilter === 'published' && (timeGranularity === 'month' || timeGranularity === 'week')) ? {
            unit: timeGranularity,
            tooltipFormat: timeGranularity === 'month' ? 'MMM yyyy' : 'MMM dd, yyyy', // Consistent yyyy
            displayFormats: {
              month: 'MMM yyyy',
              week: 'MMM dd, yyyy', // Format for the start of the week
            },
        } : undefined, // Ensure 'time' object is undefined when not in use
        title: {
          display: true,
          text: dateTypeFilter === 'published' ? (timeGranularity === 'year' ? 'Year' : (timeGranularity === 'month' ? 'Month' : 'Week')) : 'Year',
          font: {
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Projects',
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // 2. Data for Most Popular Tags (Pie Chart) - No changes
  const mostPopularTagsData = () => {
    const tagCounts = {};
    allSps.forEach(sp => {
      if (sp.tags && Array.isArray(sp.tags)) {
        sp.tags.forEach(tag => {
          const tagName = getTagName(tag.tagId);
          tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
        });
      }
    });

    const labels = Object.keys(tagCounts);
    const data = labels.map(label => tagCounts[label]);

    const sortedData = labels.map(label => ({ label, count: tagCounts[label] }))
                              .sort((a, b) => b.count - a.count);

    const sortedLabels = sortedData.map(item => item.label);
    const sortedCounts = sortedData.map(item => item.count);

    const backgroundColors = sortedLabels.map((_, i) => `hsl(${(i * 137) % 360}, 70%, 60%)`);
    const borderColors = sortedLabels.map((_, i) => `hsl(${(i * 137) % 360}, 70%, 40%)`);

    return {
      labels: sortedLabels,
      datasets: [
        {
          data: sortedCounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const mostPopularTagsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Most Popular Tags',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed;
            }
            return label;
          }
        }
      }
    },
  };

  // 3. Data for SP View Count vs. Date (Dynamic Chart: Scatter or Bar) - No changes
  const spViewCountVsDateData = () => {
    if (dateTypeFilter === 'published') {
      const dataPoints = allSps
        .filter(sp => sp.dateIssued && isValid(sp.dateIssued) && sp.viewCount !== undefined && sp.viewCount !== null)
        .map(sp => ({
          x: sp.dateIssued,
          y: sp.viewCount,
          title: sp.title,
        }));

      return {
        datasets: [
          {
            label: 'Project View Counts (Published Date)',
            data: dataPoints,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    } else {
      const viewCountsByPeriod = {};

      allSps.forEach(sp => {
        let key;
        if (sp.year) {
            key = String(sp.year);
        }

        if (key && sp.viewCount !== undefined && sp.viewCount !== null) {
          if (!viewCountsByPeriod[key]) {
            viewCountsByPeriod[key] = [];
          }
          viewCountsByPeriod[key].push(sp.viewCount);
        }
      });

      const labels = Object.keys(viewCountsByPeriod).sort((a,b) => parseInt(a) - parseInt(b));

      const data = labels.map(label => {
        const counts = viewCountsByPeriod[label];
        return counts.length > 0 ? counts.reduce((sum, val) => sum + val, 0) / counts.length : 0;
      });

      return {
        labels: labels,
        datasets: [
          {
            label: 'Average View Count (Written Date)',
            data: data,
            backgroundColor: 'rgba(0, 128, 0, 0.7)',
            borderColor: 'rgba(0, 128, 0, 1)',
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      };
    }
  };

  const spViewCountVsDateOptions = () => {
    if (dateTypeFilter === 'published') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Project View Count vs. Published Date',
            font: {
              size: 18,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const sp = context.raw;
                return `${sp.title}: Views = ${sp.y}, Date = ${sp.x.toLocaleDateString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: timeGranularity,
              tooltipFormat: timeGranularity === 'year' ? 'yyyy' : (timeGranularity === 'month' ? 'MMM yyyy' : 'MMM dd, yyyy'),
              displayFormats: {
                year: 'yyyy',
                month: 'MMM yyyy',
                week: 'MMM dd, yyyy',
              },
            },
            title: {
              display: true,
              text: 'Published Date',
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'View Count',
              font: {
                size: 14,
              },
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      };
    } else {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Average Project View Count Per Written Year`,
            font: {
              size: 18,
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Written Year',
              font: {
                size: 14,
              },
            },
            grid: {
                display: false,
            }
          },
          y: {
            title: {
              display: true,
              text: 'Average View Count',
              font: {
                size: 14,
              },
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      };
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Dashboard />
          <div className="flex-1 flex items-center justify-center text-gray-700">
            Loading dashboard data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Dashboard />
          <div className="flex-1 flex items-center justify-center text-red-600">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter" style={{ backgroundColor: 'white' }}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard Sidebar */}
        <div className="w-64 flex-shrink-0 bg-white shadow-lg">
          <Dashboard />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto" style={{ marginLeft: '20%', marginTop: '10%', paddingRight: '10%' }}>
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Special Projects Dashboard</h1>

          {/* Filters Section (Global Filters for some charts, others have their own) */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-wrap items-center gap-4 dashboard-filters">
            <h2 className="text-xl font-semibold text-gray-700 mr-4">Dashboard Filters:</h2>

            {/* Date Type Filter (Published vs Written) */}
            <div className="flex items-center gap-2">
              <label htmlFor="date-type-select" className="text-gray-600 font-medium">Date Type:</label>
              <select
                id="date-type-select"
                value={dateTypeFilter}
                onChange={(e) => setDateTypeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-600 focus:border-transparent"
              >
                <option value="published">Published Date</option>
                <option value="written">Written Date (Year/Semester)</option>
              </select>
            </div>

            {/* Granularity Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <label className="text-gray-600 font-medium">Time Granularity:</label>
              <button
                onClick={() => setTimeGranularity('year')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${timeGranularity === 'year' ? 'bg-maroon-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeGranularity('month')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${timeGranularity === 'month' ? 'bg-maroon-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                disabled={dateTypeFilter === 'written'} // Disable for 'written'
              >
                Month
              </button>
              <button
                onClick={() => setTimeGranularity('week')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${timeGranularity === 'week' ? 'bg-maroon-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                disabled={dateTypeFilter === 'written'} // Disable for 'written'
              >
                Week
              </button>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 charts-grid">

            {/* Projects Over Time (Line Chart) */}
            <div className="bg-white p-6 rounded-lg shadow-md chart-card col-span-full">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Projects {dateTypeFilter === 'published' ? 'Published' : 'Written'} Over Time
              </h2>
              <div className="h-full w-full">
                <Line
                  key={`projects-over-time-${dateTypeFilter}-${timeGranularity}`}
                  data={projectsOverTimeData()}
                  options={projectsOverTimeOptions}
                />
              </div>
            </div>

            {/* Most Popular Tags (Pie Chart) */}
            <div className="bg-white p-6 rounded-lg shadow-md chart-card pie-chart-card">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Popular Tags</h2>
              <div className="h-full w-full flex items-center justify-center">
                <Pie data={mostPopularTagsData()} options={mostPopularTagsOptions} />
              </div>
            </div>

            {/* SP View Count vs. Date (Dynamic Chart: Scatter or Bar) */}
            <div className="bg-white p-6 rounded-lg shadow-md chart-card col-span-full">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Project View Count vs. {dateTypeFilter === 'published' ? 'Published Date' : 'Written Date'}
              </h2>
              <div className="h-full w-full">
                {dateTypeFilter === 'published' ? (
                  <Scatter
                    key={`view-count-published-${timeGranularity}`}
                    data={spViewCountVsDateData()}
                    options={spViewCountVsDateOptions()}
                  />
                ) : (
                  <Bar
                    key={`view-count-written`}
                    data={spViewCountVsDateData()}
                    options={spViewCountVsDateOptions()}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SPDashboard;