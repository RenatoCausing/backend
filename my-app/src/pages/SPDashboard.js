// src/pages/SPDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Dashboard from '../components/Dashboard';
import Navbar from '../components/AdviserNavbar'; // Assuming you use this Navbar
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // For Pie chart
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define your backend URL
const BACKEND_URL = 'http://localhost:8080';

const SPDashboard = () => {
  const [allSps, setAllSps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  // Add other filter states as needed (e.g., selectedTag, selectedAdviser)

  // State to hold unique years and semesters for filter dropdowns
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]); // Will be populated dynamically

  useEffect(() => {
    // Fetch all SPs when the component mounts
    const fetchAllSPs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/sp/all`);
        const data = response.data;
        setAllSps(data);

        // Extract unique years for filtering
        const years = [...new Set(data.map(sp => sp.year).filter(Boolean))].sort((a,b) => b - a);
        setAvailableYears(['All', ...years]);

      } catch (err) {

      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSPs();
  }, []); // Empty dependency array means this runs once on mount

  // --- Data Processing for Charts ---

  // Filtered SPs based on selected year/semester
  const filteredSps = allSps.filter(sp => {
    const matchesYear = selectedYear === 'All' || sp.year === parseInt(selectedYear);
    const matchesSemester = selectedSemester === 'All' || sp.semester === selectedSemester;
    return matchesYear && matchesSemester;
  });

  // 1. Data for Projects Posted Over Time (Bar Chart)
  // This will dynamically adapt based on selectedYear
  const projectsOverTimeData = () => {
    let labels = [];
    let counts = [];

    if (selectedYear === 'All') {
      // Group by year if "All" years are selected
      const yearCounts = filteredSps.reduce((acc, sp) => {
        if (sp.year) {
          acc[sp.year] = (acc[sp.year] || 0) + 1;
        }
        return acc;
      }, {});
      labels = Object.keys(yearCounts).sort();
      counts = labels.map(year => yearCounts[year]);
    } else {
      // Group by semester for a specific year
      const semesterOrder = ['First Semester', 'Second Semester', 'Summer']; // Define order
      const semesterCounts = filteredSps.reduce((acc, sp) => {
        if (sp.semester) {
          acc[sp.semester] = (acc[sp.semester] || 0) + 1;
        }
        return acc;
      }, {});
      labels = semesterOrder.filter(sem => Object.keys(semesterCounts).includes(sem));
      counts = labels.map(sem => semesterCounts[sem] || 0);

      // Populate available semesters for the dropdown based on the selected year's data
      const semestersInYear = [...new Set(allSps.filter(sp => sp.year === parseInt(selectedYear)).map(sp => sp.semester).filter(Boolean))];
      setAvailableSemesters(['All', ...semesterOrder.filter(sem => semestersInYear.includes(sem))]);
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Number of Projects Posted',
          data: counts,
          backgroundColor: 'rgba(128, 0, 0, 0.7)', // Maroon color
          borderColor: 'rgba(128, 0, 0, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const projectsOverTimeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedYear === 'All' ? 'Projects Posted Per Year' : `Projects Posted in ${selectedYear} Per Semester`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: selectedYear === 'All' ? 'Year' : 'Semester',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Projects',
        },
        beginAtZero: true,
      },
    },
  };

  // 2. Data for Top 5 Projects by View Count (Bar Chart)
  const topProjectsByViewCountData = () => {
    const sortedSps = [...allSps].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    return {
      labels: sortedSps.map(sp => sp.title),
      datasets: [
        {
          label: 'View Count',
          data: sortedSps.map(sp => sp.viewCount),
          backgroundColor: 'rgba(0, 128, 0, 0.7)', // Green color
          borderColor: 'rgba(0, 128, 0, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const topProjectsByViewCountOptions = {
    responsive: true,
    indexAxis: 'y', // Makes it a horizontal bar chart
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Projects by View Count',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'View Count',
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: 'Project Title',
        },
      },
    },
  };

  // 3. Data for Project Distribution by Tags (Pie Chart)
  // NOTE: You'll need a way to map tagIds to tag names.
  // For demonstration, I'll use placeholder tag names.
  // Ideally, you'd fetch tags from your backend via another endpoint like /api/tags or /api/sp/tags
  const getTagName = (tagId) => {
    // Placeholder: In a real app, fetch or map from a tags list
    const tagMap = {
      1: 'AI & Machine Learning',
      2: 'Web Development',
      3: 'Mobile Development',
      4: 'Cybersecurity',
      5: 'Data Science',
      6: 'Blockchain',
      7: 'IoT',
      8: 'Game Development',
      9: 'Cloud Computing',
      10: 'Networking',
    };
    return tagMap[tagId] || `Tag ${tagId}`;
  };

  const projectDistributionByTagsData = () => {
    const tagCounts = {};
    allSps.forEach(sp => {
      if (sp.tagIds && Array.isArray(sp.tagIds)) {
        sp.tagIds.forEach(tagId => {
          const tagName = getTagName(tagId); // Get actual tag name
          tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
        });
      }
    });

    const labels = Object.keys(tagCounts);
    const data = labels.map(label => tagCounts[label]);

    // Generate dynamic colors
    const backgroundColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);
    const borderColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 40%)`);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const projectDistributionByTagsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Project Distribution by Tags',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="loading-state">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    
   <div className="flex flex-1 overflow-hidden">
         <Navbar />
        <div className="w-80 flex-shrink-0">
          <Dashboard/>
        </div>

      <div className="dashboard-content">
        <h1>Special Projects Dashboard</h1>

        {/* Filters Section */}
        <div className="dashboard-filters">
          <label htmlFor="year-select">Filter by Year:</label>
          <select id="year-select" value={selectedYear} onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedSemester('All'); // Reset semester when year changes
          }}>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {selectedYear !== 'All' && (
            <>
              <label htmlFor="semester-select" style={{ marginLeft: '20px' }}>Filter by Semester:</label>
              <select id="semester-select" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                {availableSemesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h2>Projects Over Time</h2>
            <Bar data={projectsOverTimeData()} options={projectsOverTimeOptions} />
          </div>

          <div className="chart-card">
            <h2>Top 5 Projects</h2>
            <Bar data={topProjectsByViewCountData()} options={topProjectsByViewCountOptions} />
          </div>

          <div className="chart-card pie-chart-card"> {/* Added a class for pie chart specific styling */}
            <h2>Projects by Tags</h2>
            <Pie data={projectDistributionByTagsData()} options={projectDistributionByTagsOptions} />
          </div>

          {/* You can add more charts here, e.g., Projects by Faculty/Adviser */}
        </div>
      </div>
    </div>
  );
};

export default SPDashboard;
