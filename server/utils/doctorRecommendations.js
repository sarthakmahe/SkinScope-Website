const cityDoctorPool = {
  Delhi: [
    {
      id: 'delhi-1',
      name: 'Dr. Ananya Sharma',
      specialty: 'Dermatologist',
      hospital: 'SkinCare Clinic',
      location: 'Delhi',
      experience: '9 years',
      availability: 'Mon-Sat, 10:00 AM - 6:00 PM'
    },
    {
      id: 'delhi-2',
      name: 'Dr. Ishita Kapoor',
      specialty: 'Dermatologist',
      hospital: 'City Skin Hospital',
      location: 'Delhi',
      experience: '10 years',
      availability: 'Mon-Sat, 11:00 AM - 7:00 PM'
    },
    {
      id: 'delhi-3',
      name: 'Dr. Karan Malhotra',
      specialty: 'Dermatologist',
      hospital: 'Derma Plus Centre',
      location: 'Delhi',
      experience: '8 years',
      availability: 'Tue-Sun, 9:30 AM - 5:30 PM'
    }
  ],
  Mumbai: [
    {
      id: 'mumbai-1',
      name: 'Dr. Rohan Mehta',
      specialty: 'Dermatologist',
      hospital: 'Clear Skin Centre',
      location: 'Mumbai',
      experience: '11 years',
      availability: 'Tue-Sun, 11:00 AM - 7:00 PM'
    },
    {
      id: 'mumbai-2',
      name: 'Dr. Meera Kulkarni',
      specialty: 'Dermatologist',
      hospital: 'Coastal Derma Care',
      location: 'Mumbai',
      experience: '12 years',
      availability: 'Mon-Sat, 10:00 AM - 5:00 PM'
    },
    {
      id: 'mumbai-3',
      name: 'Dr. Saurabh Desai',
      specialty: 'Dermatologist',
      hospital: 'Westline Skin Studio',
      location: 'Mumbai',
      experience: '7 years',
      availability: 'Mon-Fri, 1:00 PM - 8:00 PM'
    }
  ],
  Bengaluru: [
    {
      id: 'bengaluru-1',
      name: 'Dr. Priya Nair',
      specialty: 'Dermatologist',
      hospital: 'Derma Relief Hospital',
      location: 'Bengaluru',
      experience: '12 years',
      availability: 'Mon-Fri, 9:30 AM - 5:30 PM'
    },
    {
      id: 'bengaluru-2',
      name: 'Dr. Rahul Iyer',
      specialty: 'Dermatologist',
      hospital: 'Bengaluru Skin Institute',
      location: 'Bengaluru',
      experience: '9 years',
      availability: 'Mon-Sat, 10:00 AM - 6:00 PM'
    },
    {
      id: 'bengaluru-3',
      name: 'Dr. Sneha Reddy',
      specialty: 'Dermatologist',
      hospital: 'CureDerma Clinic',
      location: 'Bengaluru',
      experience: '6 years',
      availability: 'Tue-Sun, 11:30 AM - 7:30 PM'
    }
  ],
  Hyderabad: [
    {
      id: 'hyderabad-1',
      name: 'Dr. Neha Verma',
      specialty: 'Dermatologist',
      hospital: 'Advanced Skin Institute',
      location: 'Hyderabad',
      experience: '14 years',
      availability: 'Mon-Sat, 10:00 AM - 4:00 PM'
    },
    {
      id: 'hyderabad-2',
      name: 'Dr. Arvind Rao',
      specialty: 'Dermatologist',
      hospital: 'Metro Derma Hub',
      location: 'Hyderabad',
      experience: '10 years',
      availability: 'Mon-Fri, 9:00 AM - 5:00 PM'
    },
    {
      id: 'hyderabad-3',
      name: 'Dr. Pooja Sinha',
      specialty: 'Dermatologist',
      hospital: 'Skin Wellness Point',
      location: 'Hyderabad',
      experience: '8 years',
      availability: 'Tue-Sun, 12:00 PM - 8:00 PM'
    }
  ],
  Chennai: [
    {
      id: 'chennai-1',
      name: 'Dr. Vivek Rao',
      specialty: 'Dermatologist',
      hospital: 'Metro Skin Care',
      location: 'Chennai',
      experience: '13 years',
      availability: 'Mon-Fri, 9:00 AM - 5:00 PM'
    },
    {
      id: 'chennai-2',
      name: 'Dr. Lakshmi Narayan',
      specialty: 'Dermatologist',
      hospital: 'South City Dermaclinic',
      location: 'Chennai',
      experience: '11 years',
      availability: 'Mon-Sat, 10:30 AM - 6:30 PM'
    },
    {
      id: 'chennai-3',
      name: 'Dr. Harini Subramanian',
      specialty: 'Dermatologist',
      hospital: 'Marina Skin Hospital',
      location: 'Chennai',
      experience: '7 years',
      availability: 'Tue-Sun, 11:00 AM - 7:00 PM'
    }
  ]
};

const focusByCondition = {
  acne: 'Acne and oily skin care',
  eczema: 'Eczema and dermatitis care',
  psoriasis: 'Psoriasis management',
  fungal: 'Fungal infection treatment',
  general: 'General skin consultation'
};

function normalizePrediction(prediction = '') {
  return prediction.toLowerCase().trim();
}

function getConditionKey(prediction) {
  const normalized = normalizePrediction(prediction);

  if (normalized.includes('acne')) {
    return 'acne';
  }
  if (normalized.includes('eczema') || normalized.includes('dermatitis')) {
    return 'eczema';
  }
  if (normalized.includes('psoriasis')) {
    return 'psoriasis';
  }
  if (normalized.includes('fungal') || normalized.includes('ringworm') || normalized.includes('tinea')) {
    return 'fungal';
  }

  return 'general';
}

function getRecommendedDoctors(prediction) {
  const conditionKey = getConditionKey(prediction);
  const focus = focusByCondition[conditionKey];

  return Object.values(cityDoctorPool)
    .flat()
    .map((doctor) => ({
      ...doctor,
      id: `${conditionKey}-${doctor.id}`,
      focus
    }));
}

module.exports = { getRecommendedDoctors };
