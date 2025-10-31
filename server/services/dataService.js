const generateTestData = (count = 5000) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      description: `This is item number ${i + 1}`,
      timestamp: new Date().toISOString()
    });
  }
  return data;
};


const getDataStats = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      total: 0,
      average: 0,
      max: 0,
      min: 0
    };
  }

  const values = data.map(item => item.value || 0);
  const total = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / total;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return {
    total,
    average: Math.round(average * 100) / 100,
    max,
    min
  };
};

module.exports = {
  generateTestData,
  getDataStats
};