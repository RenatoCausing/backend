import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Dashboard from '../components/Dashboard';
import Navbar from '../components/AdviserNavbar';
import '../styles/SPDashboard.css';
import GraphModal from '../components/GraphModal';

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
  min as dateFnsMin,
  max as dateFnsMax,
  isValid,
  isThisWeek, // Import for current week check
  isThisMonth, // Import for current month check
  isToday, // Import for current day check
} from 'date-fns';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';

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
const BACKEND_URL = 'http://localhost:8080';

// Define the fixed faculty mappings here
const FACULTY_MAP = {
  1: 'BSBC',
  2: 'BSCS',
  3: 'BSAP',
};
// Define colors for each faculty
const FACULTY_COLORS = {
    'BSBC': 'rgba(75, 192, 192, 0.7)', // Teal
    'BSCS': 'rgba(255, 99, 132, 0.7)', // Pink
    'BSAP': 'rgba(153, 102, 255, 0.7)', // Purple
    'Faculty Not Found': 'rgba(128, 128, 128, 0.5)', // Grey for unknown
    'Unknown Faculty': 'rgba(128, 128, 128, 0.5)', // Grey for unknown
};
const FACULTY_BORDER_COLORS = {
    'BSBC': 'rgba(75, 192, 192, 1)',
    'BSCS': 'rgba(255, 99, 132, 1)',
    'BSAP': 'rgba(153, 102, 255, 1)',
    'Faculty Not Found': 'rgba(128, 128, 128, 0.8)',
    'Unknown Faculty': 'rgba(128, 128, 128, 0.8)',
};
const SPDashboard = () => {
  const [allSps, setAllSps] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagViewCounts, setTagViewCounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adviserFacultyMap, setAdviserFacultyMap] = useState({});
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');

  const [timeGranularity, setTimeGranularity] = useState('year');
  const [dateTypeFilter, setDateTypeFilter] = useState('published');
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // State for new counts
  const [spsThisWeek, setSpsThisWeek] = useState(0);
  const [spsThisMonth, setSpsThisMonth] = useState(0);
  const [spsToday, setSpsToday] = useState(0);
  useEffect(() => {
    if (dateTypeFilter === 'written' && timeGranularity !== 'year') {
      setTimeGranularity('year');
    }
  }, [dateTypeFilter, timeGranularity]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spResponse, tagsResponse, tagViewsResponse] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/sp`),
          axios.get(`${BACKEND_URL}/api/tags`),
          axios.get(`${BACKEND_URL}/api/tags/view-counts`),
        ]);

        const spData = spResponse.data.map(sp => ({
          ...sp,
      
          // Ensure dateIssued is a valid Date object, handling yyyy-mm-dd format
          dateIssued: (sp.dateIssued && !isNaN(new Date(sp.dateIssued))) ? new Date(sp.dateIssued) : null,
          viewCount: sp.viewCount !== undefined && sp.viewCount !== null ? sp.viewCount : 0
        }));
        setAllSps(spData);
        setAllTags(tagsResponse.data);

        const processedTagViewCounts = tagViewsResponse.data.map(tagView => ({
         
          ...tagView,
          tagName: getTagName(tagView.tagId, tagsResponse.data)
        }));
        setTagViewCounts(processedTagViewCounts);

        const years = [...new Set(spData.map(sp => sp.year).filter(Boolean))].sort((a, b) => b - a);
        setAvailableYears(['All', ...years]);

        // Calculate new counts
        const now = new Date();
        let weekCount = 0;
        let monthCount = 0;
        let todayCount = 0; // Changed from 'today' to 'todayCount' and added 'let'
        spData.forEach(sp => {
          if (sp.dateIssued && isValid(sp.dateIssued)) {
            if (isThisWeek(sp.dateIssued, { weekStartsOn: 0 })) { // Sunday as week start
              weekCount++;
            }
            if (isThisMonth(sp.dateIssued)) {
              monthCount++;
       
            }
            if (isToday(sp.dateIssued)) {
              todayCount++;
            }
          }
        });
        setSpsThisWeek(weekCount);
        setSpsThisMonth(monthCount);
        setSpsToday(todayCount);


      } catch (err) {
        console.error("Error fetching initial dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAdviserDetails = async () => {
      const uniqueAdviserIds = [...new Set(allSps.map(sp => sp.adviserId).filter(id => id !== undefined && id !== null))];
      const newAdviserFacultyMap = { ...adviserFacultyMap };

      const fetchPromises = uniqueAdviserIds.map(async (adviserId) => {
        if (!(adviserId in newAdviserFacultyMap)) {
          try {
            const response 
            = await axios.get(`${BACKEND_URL}/api/advisers/${adviserId}`);
            newAdviserFacultyMap[adviserId] = { facultyId: response.data.facultyId };
          } catch (err) {
            console.error(`Error fetching adviser ${adviserId} details:`, err);
            newAdviserFacultyMap[adviserId] = { facultyId: null };
          }
        }
      });

      await Promise.all(fetchPromises);
   
      setAdviserFacultyMap(newAdviserFacultyMap);
    };

    if (allSps.length > 0) {
      fetchAdviserDetails();
    }
  }, [allSps]);
  useEffect(() => {
    if (selectedYear !== 'All') {
      const semesterOrder = ['First Semester', 'Second Semester', 'Summer'];
      const semestersInYear = [...new Set(allSps.filter(sp => sp.year === parseInt(selectedYear)).map(sp => sp.semester).filter(Boolean))].sort((a,b) => {
        // Custom sort to maintain order
        const order = ['First Semester', 'Second Semester', 'Summer'];
        return order.indexOf(a) - order.indexOf(b);
      });
      setAvailableSemesters(['All', ...semesterOrder.filter(sem => semestersInYear.includes(sem))]);
    } else {
      setAvailableSemesters([]);
    }
  }, [selectedYear, allSps]);
  const getTagName = (tagId, tagsArray = allTags) => {
    const tag = tagsArray.find(t => t.tagId === tagId);
    return tag ? tag.tagName : `Unknown Tag (${tagId})`;
  };

  const getFacultyNameForAdviser = (adviserId) => {
    const adviserDetails = adviserFacultyMap[adviserId];
    if (adviserDetails && adviserDetails.facultyId !== null) {
      return FACULTY_MAP[adviserDetails.facultyId] || `Unknown Faculty (${adviserDetails.facultyId})`;
    }
    return 'Faculty Not Found';
  };

  // --- Chart Data Functions ---

  // 1. Projects Over Time Data (Line Chart)
  const projectsOverTimeData = () => {
    const counts = {};
    let labels = [];
    let data = [];

    if (dateTypeFilter === 'published') {
      const validDates = allSps
        .filter(sp => sp.dateIssued && isValid(sp.dateIssued))
        .map(sp => sp.dateIssued);
      if (validDates.length === 0) {
        return { labels: [], datasets: [{ label: '', data: [] }] };
      }

      const minDate = dateFnsMin(validDates);
      const maxDate = dateFnsMax(validDates);
      validDates.forEach(date => {
        let key;
        if (timeGranularity === 'year') {
          key = format(date, 'yyyy');
        } else if (timeGranularity === 'month') {
          key = format(date, 'yyyy-MM'); // Use 'yyyy-MM' for consistent keys
        } else if (timeGranularity === 'week') {
          key = format(date, 'yyyy-ww'); // Use 'yyyy-ww' 
          // for consistent keys
        }
        counts[key] = (counts[key] || 0) + 1;
      });
      // Generate labels as Date objects for time scale
      if (timeGranularity === 'year') {
        labels = eachYearOfInterval({ start: minDate, end: maxDate }).map(d => d);
      } else if (timeGranularity === 'month') {
        labels = eachMonthOfInterval({ start: minDate, end: maxDate }).map(d => d);
      } else if (timeGranularity === 'week') {
        labels = eachWeekOfInterval({ start: minDate, end: maxDate }, { weekStartsOn: 0 }).map(d => d);
      }
      
      // Map labels (Date objects) back to the keys used in counts
      // This ensures data points align with the generated labels for missing periods
      data = labels.map(labelDate => {
        let key;
        if (timeGranularity === 'year') {
          key = format(labelDate, 'yyyy');
        } else if (timeGranularity === 'month') {
 
          key = format(labelDate, 'yyyy-MM');
        } else if (timeGranularity === 'week') {
          key = format(labelDate, 'yyyy-ww');
        }
        return counts[key] || 0;
      });
    } else if (dateTypeFilter === 'written') {
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
      labels: labels, // Now contains Date objects for 'published' filter
      datasets: [
        {
          label: `Number of Projects ${dateTypeFilter === 'published' ?
            'Published' : 'Written'}`,
          data: data,
          fill: false,
          borderColor: 'rgb(128, 0, 0)',
          tension: 0.1,
          pointBackgroundColor: 'rgb(128, 0, 0)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(128, 0, 0)',
    
        },
      ],
    };
  };
  // Corrected to be a function
  const projectsOverTimeOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Projects ${dateTypeFilter === 'published' ?
          'Published' : 'Written'} Per ${dateTypeFilter === 'published' ? (timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)) : 'Year'}`,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        type: dateTypeFilter === 'published' ?
          'time' : 'category', // Always 'time' for published dates
        time: dateTypeFilter === 'published' ?
          {
            unit: timeGranularity,
            tooltipFormat: timeGranularity === 'year' ?
              'yyyy' : (timeGranularity === 'month' ? 'MMM yyyy' : 'MMM dd, yyyy'),
            displayFormats: {
              year: 'yyyy',
              month: 'MMM yyyy',
              week: 'MMM dd, yyyy',
            },
          } : undefined,
        title: {
       
          display: true,
          text: dateTypeFilter === 'published' ?
            (timeGranularity === 'year' ? 'Year' : (timeGranularity === 'month' ? 'Month' : 'Week')) : 'Year',
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
  });
  // NEW: Projects Published by Faculty Over Time (Stacked Bar Chart)
  const projectsByFacultyOverTimeData = () => {
    const dataByFacultyAndPeriod = {};
    let periodLabels = [];
    const facultyNames = Object.values(FACULTY_MAP);

    // This chart only uses 'published' dates
    const validDates = allSps
        .filter(sp => sp.dateIssued && isValid(sp.dateIssued))
        .map(sp => sp.dateIssued);
    if (validDates.length === 0) {
        return { labels: [], datasets: [] };
    }

    const minDate = dateFnsMin(validDates);
    const maxDate = dateFnsMax(validDates);
    // Populate all periods based on granularity, using Date objects
    if (timeGranularity === 'year') {
      periodLabels = eachYearOfInterval({ start: minDate, end: maxDate }).map(d => d);
    } else if (timeGranularity === 'month') {
      periodLabels = eachMonthOfInterval({ start: minDate, end: maxDate }).map(d => d);
    } else if (timeGranularity === 'week') {
      periodLabels = eachWeekOfInterval({ start: minDate, end: maxDate }, { weekStartsOn: 0 }).map(d => d);
    }

    // Initialize counts for all faculties for all periods
    periodLabels.forEach(periodDate => {
      let periodKey;
      if (timeGranularity === 'year') {
        periodKey = format(periodDate, 'yyyy');
      } else if (timeGranularity === 'month') {
        periodKey = format(periodDate, 'yyyy-MM');
      } else if (timeGranularity === 'week') {
        periodKey = format(periodDate, 'yyyy-ww');
      }

  
      dataByFacultyAndPeriod[periodKey] = {};
      facultyNames.forEach(faculty => {
        dataByFacultyAndPeriod[periodKey][faculty] = 0;
      });
      dataByFacultyAndPeriod[periodKey]['Faculty Not Found'] = 0;
      dataByFacultyAndPeriod[periodKey]['Unknown Faculty'] = 0;
    });
    // Aggregate data
    allSps.forEach(sp => {
      if (sp.dateIssued && isValid(sp.dateIssued)) {
        let periodKey;
        if (timeGranularity === 'year') {
          periodKey = format(sp.dateIssued, 'yyyy');
        } else if (timeGranularity === 'month') {
          periodKey = format(sp.dateIssued, 'yyyy-MM');
        } else if (timeGranularity === 'week') {
       
          periodKey = format(sp.dateIssued, 'yyyy-ww');
        }

        const facultyName = getFacultyNameForAdviser(sp.adviserId);

        if (dataByFacultyAndPeriod[periodKey]) {
          dataByFacultyAndPeriod[periodKey][facultyName] = (dataByFacultyAndPeriod[periodKey][facultyName] || 0) + 1;
        }
      }
    });
    // Prepare datasets for Chart.js
    const datasets = facultyNames.map(faculty => {
      const data = periodLabels.map(periodDate => {
        let periodKey;
        if (timeGranularity === 'year') {
          periodKey = format(periodDate, 'yyyy');
        } else if (timeGranularity === 'month') {
          periodKey = format(periodDate, 'yyyy-MM');
        } else if (timeGranularity === 'week') {
          periodKey = format(periodDate, 'yyyy-ww');
        }
        return dataByFacultyAndPeriod[periodKey][faculty] || 0;
      });
      return {
        label: faculty,
        data: data,
        backgroundColor: FACULTY_COLORS[faculty],
        borderColor: FACULTY_BORDER_COLORS[faculty],
        borderWidth: 1,
      };
    });
    const notFoundData = periodLabels.map(periodDate => {
      let periodKey;
        if (timeGranularity === 'year') {
          periodKey = format(periodDate, 'yyyy');
        } else if (timeGranularity === 'month') {
          periodKey = format(periodDate, 'yyyy-MM');
        } else if (timeGranularity === 'week') {
          periodKey = format(periodDate, 'yyyy-ww');
        }
 
      return dataByFacultyAndPeriod[periodKey]['Faculty Not Found'] || 0;
    });
    const unknownFacultyData = periodLabels.map(periodDate => {
      let periodKey;
        if (timeGranularity === 'year') {
          periodKey = format(periodDate, 'yyyy');
        } else if (timeGranularity === 'month') {
          periodKey = format(periodDate, 'yyyy-MM');
        } else if (timeGranularity === 'week') {
          periodKey = format(periodDate, 'yyyy-ww');
        }
 
      return dataByFacultyAndPeriod[periodKey]['Unknown Faculty'] || 0;
    });
    if (notFoundData.some(val => val > 0)) {
        datasets.push({
            label: 'Faculty Not Found',
            data: notFoundData,
            backgroundColor: FACULTY_COLORS['Faculty Not Found'],
            borderColor: FACULTY_BORDER_COLORS['Faculty Not Found'],
            borderWidth: 1,
        });
    }
    if (unknownFacultyData.some(val => val > 0)) {
        datasets.push({
            label: 'Unknown Faculty',
            data: unknownFacultyData,
            backgroundColor: FACULTY_COLORS['Unknown Faculty'],
            borderColor: FACULTY_BORDER_COLORS['Unknown Faculty'],
            borderWidth: 1,
        });
    }

    return {
      labels: periodLabels, // Now contains Date objects
      datasets: datasets,
    };
  };
  // Corrected to be a function
  const projectsByFacultyOverTimeOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Number of Projects Published by Faculty Over Time (${timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)})`,
        font: {
          size: 18,
    
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label ||
 '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' Projects';
            }
            return label;
          },
          footer: function(tooltipItems) {
            let total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return 'Total: ' + total + ' Projects';
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        type: 'time', // Always 'time' for published dates
        time: {
          unit: timeGranularity,
          tooltipFormat: timeGranularity === 'year' ?
            'yyyy' : (timeGranularity === 'month' ? 'MMM yyyy' : 'MMM dd, yyyy'),
          displayFormats: {
            year: 'yyyy',
            month: 'MMM yyyy',
            week: 'MMM dd, yyyy',
          },
        },
        title: {
         
          display: true,
          text: `Time (${timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)})`,
          font: {
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
 
        stacked: true,
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
  });
  // 3. Data for SP View Count vs. Date (Dynamic Chart: Scatter or Bar) - No Change needed here for `dateIssued` format, as `x` is already a Date object
  const spViewCountVsDateData = () => {
    if (dateTypeFilter === 'published') {
      const dataPoints = allSps
        .filter(sp => sp.dateIssued && isValid(sp.dateIssued) && sp.viewCount !== undefined && sp.viewCount !== null)
        .map(sp => ({
          x: sp.dateIssued, // x is already a Date 
          // object here...
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
      const countsByYear = {};
      allSps.filter(sp => sp.year).forEach(sp => {
        if (!countsByYear[sp.year]) {
          countsByYear[sp.year] = { totalViews: 0, count: 0 };
        }
        countsByYear[sp.year].totalViews += (sp.viewCount || 0);
        countsByYear[sp.year].count++;
      });

      const averageViews = Object.keys(countsByYear).map(year => ({
        year: parseInt(year),
        averageViewCount: countsByYear[year].count > 0 ? countsByYear[year].totalViews / countsByYear[year].count : 0,
      })).sort((a, b) => a.year - b.year);

      return {
        labels: averageViews.map(data => data.year),
        datasets: [
          {
            label: 'Average View Count Per Year',
            data: averageViews.map(data => data.averageViewCount),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      };
    }
  };
  // Corrected to be a function
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
              tooltipFormat: timeGranularity === 'year' ?
                'yyyy' : (timeGranularity === 'month' ? 'MMM yyyy' : 'MMM dd, yyyy'),
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
              // Removed stepSize: 1
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
              // Removed stepSize: 1
            },
          },
        },
      };
    }
  };
  // 4. Data for Total Project Views by Tag (Bar Chart) - No Change
  const tagViewCountsChartData = () => {
    const sortedTags = [...tagViewCounts].sort((a, b) => b.totalViews - a.totalViews);
    const top10Tags = sortedTags.slice(0, 10);
    const labels = top10Tags.map(tag => tag.tagName);
    const data = top10Tags.map(tag => tag.totalViews);
    return {
      labels: labels,
      datasets: [
        {
          label: 'Total Views Per Tag',
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    };
  };

  const tagViewCountsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Tags by Total Views',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tag Name',
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
          text: 'Total View Count',
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
        ticks: {
          // Removed stepSize: 1
        },
      },
    },
  };

  // --- Modal Logic ---
  const handleGraphClick = (title, chartType, chartData, chartOptions) => {
    setModalTitle(title);
    setModalContent(
      chartType === 'Line' ? (
        <Line data={chartData} options={chartOptions} />
      ) : chartType === 'Pie' ? (
        <Pie data={chartData} options={chartOptions} />
      ) : chartType === 'Scatter' ? (
        <Scatter data={chartData} options={chartOptions} />
      ) : chartType === 'Bar' ? (
        <Bar data={chartData} options={chartOptions} />
      ) : null
    );
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalTitle('');
  };

  const isDataReadyForDisplay = !isLoading && (allSps.length === 0 || Object.keys(adviserFacultyMap).length === new Set(allSps.map(sp => sp.adviserId).filter(id => id !== undefined && id !== null)).size);

  if (!isDataReadyForDisplay) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-700">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-600">
          Error: {error}
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
          {/* Removed border-l-4 border-maroon-700 from here */}
          <h1 className="text-3xl font-bold text-gray-800 text-center" style = {{marginBottom: '3rem'}}>Admin Dashboard</h1>

          {/* New: Stats Blobs Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stat-cards-container"> {/* Added stat-cards-container class */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center stat-card">
              <h3 className="text-lg font-semibold text-gray-700">SPs Posted Today</h3>
              <p className="text-4xl font-bold text-maroon-700">{spsToday}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center stat-card">
              <h3 className="text-lg font-semibold text-gray-700">SPs Posted This Week</h3>
              <p className="text-4xl font-bold text-maroon-700">{spsThisWeek}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center stat-card">
              <h3 className="text-lg font-semibold text-gray-700">SPs Posted This Month</h3>
              <p className="text-4xl font-bold text-maroon-700">{spsThisMonth}</p>
            </div>
          </div>

          {/* Filters Section */}
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
              <button
                onClick={() => setTimeGranularity('year')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${timeGranularity === 'year' ?
                  'bg-maroon-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeGranularity('month')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${timeGranularity === 'month' ?
                  'bg-maroon-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                disabled={dateTypeFilter === 'written'}
              >
                Month
              </button>
              <button
                onClick={() => setTimeGranularity('week')}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${timeGranularity === 'week' ?
                  'bg-maroon-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                disabled={dateTypeFilter === 'written'}
              >
                Week
              </button>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="year-select" className="text-gray-600 font-medium">Year:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-600 focus:border-transparent"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter (only for written date type and specific year) */}
            {dateTypeFilter === 'written' && selectedYear !== 'All' && availableSemesters.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="semester-select" className="text-gray-600 font-medium">Semester:</label>
                <select
                  id="semester-select"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-600 focus:border-transparent"
                >
                  {availableSemesters.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Projects Over Time Chart */}
            <div
              className="bg-white p-6 rounded-lg shadow-md chart-card"
              onClick={() => handleGraphClick(
                `Projects ${dateTypeFilter === 'published' ? 'Published' : 'Written'} Per ${dateTypeFilter === 'published' ? (timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)) : 'Year'}`,
                'Line',
                projectsOverTimeData(),
                projectsOverTimeOptions()
              )}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Projects Over Time
              </h2>
              <div className="h-full w-full">
                <Line
                  key={`projects-over-time-${timeGranularity}-${dateTypeFilter}`} // Key to re-render chart on filter change
                  data={projectsOverTimeData()}
                  options={projectsOverTimeOptions()}
                />
              </div>
            </div>

            {/* Projects Published by Faculty Over Time (New Chart) */}
            <div
              className="bg-white p-6 rounded-lg shadow-md chart-card"
              onClick={() => handleGraphClick(
                `Number of Projects Published by Faculty Over Time (${timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)})`,
                'Bar',
                projectsByFacultyOverTimeData(),
                projectsByFacultyOverTimeOptions()
              )}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Projects by Faculty Over Time
              </h2>
              <div className="h-full w-full">
                <Bar
                  key={`projects-by-faculty-${timeGranularity}`} // Key to re-render chart on filter change
                  data={projectsByFacultyOverTimeData()}
                  options={projectsByFacultyOverTimeOptions()}
                />
              </div>
            </div>

            {/* Total Project Views by Tag Chart */}
            <div
              className="bg-white p-6 rounded-lg shadow-md chart-card"
              onClick={() => handleGraphClick(
                'Top 10 Tags by Total Views',
                'Bar',
                tagViewCountsChartData(),
                tagViewCountsChartOptions // Passed as object, not function call
              )}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Top 10 Tags by Total Views
              </h2>
              <div className="h-full w-full">
                <Bar data={tagViewCountsChartData()} options={tagViewCountsChartOptions} />
              </div>
            </div>

            {/* SP View Count vs. Date (Dynamic Chart: Scatter or Bar) */}
            <div
              className="bg-white p-6 rounded-lg shadow-md chart-card col-span-full"
              onClick={() => handleGraphClick(
                `Project View Count vs. ${dateTypeFilter === 'published' ? 'Published Date' : 'Written Date'}`,
                dateTypeFilter === 'published' ? 'Scatter' : 'Bar',
                spViewCountVsDateData(),
                spViewCountVsDateOptions()
              )}
            >
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

      <GraphModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        chartContainerClassName="modal-chart-large"
      >
        {modalContent}
      </GraphModal>

    </div>
  );
};

export default SPDashboard;