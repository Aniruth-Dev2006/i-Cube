const lawyersData = [
  {
    "name": "Advocate Anuj Aggarwal",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate M Krishna Chaitanya",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Naveen Sheokand",
    "domain": "Criminal Law"
  },
  {
    "name": "Ram Jethmalani",
    "domain": "Criminal Law"
  },
  {
    "name": "Satish Manishinde",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Archana",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Biradar",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Khillare",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Shah",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Sarthak",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Ravi Kumar",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Priya Gupta",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Raymond Ga",
    "domain": "Property Law"
  },
  {
    "name": "Subrahmanya Kumar",
    "domain": "Property Law"
  },
  {
    "name": "Bhailappa Bala",
    "domain": "Property Law"
  },
  {
    "name": "Mohd Shakeel Khan",
    "domain": "Property Law"
  },
  {
    "name": "Mranal Surendran",
    "domain": "Property Law"
  },
  {
    "name": "Madupu Chakrapani",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Mahesh Kulkarni",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Meena Sharma",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Rajesh Kumar",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Sunita Patel",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Anil Verma",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Kavita Reddy",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Harish Pillai",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Lakshmi Menon",
    "domain": "Family Law"
  },
  {
    "name": "Cyril Shroff",
    "domain": "Corporate Law"
  },
  {
    "name": "Zia Mody",
    "domain": "Corporate Law"
  },
  {
    "name": "Shardul Shroff",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate M.R. Legale",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Pulastya Legal",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Royzz & Co",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate MZM Legal LLP",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Mukesh Patel",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Sanjay Agarwal",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Priya lyer",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Rajesh Kapoor",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Kavita Sharma",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Anil Kumar",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Neha Malhotra",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Suresh Kumar",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Meena Patel",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Rajesh lyer",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Sunita Sharma",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Anil Reddy",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Kavita Nair",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Pooja Pillai",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Prateek Sharma",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Anjali Gupta",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Rohit Patel",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Sneha Reddy",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Vikram Nair",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Priya lyer",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Aditya Verma",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Ramesh Gupta",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Priya Nair",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Suresh Kumar",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Kavita Reddy",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Anil Sharma",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Neha Patel",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Vijay Verma",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Fali S. Nariman",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Harish Salve",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Kapil Sibal",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Abhishek Manu Singhvi",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Mukul Rohatgi",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate K.K. Venugopal",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Soli Sorabjee",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Pravin Anand",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Prathiba M. Singh",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate C.S. Rajan",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Chander M. Lall",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Rajiv Shankar",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Sudhir Ravindran",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Atul Dua",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Somasekhar Sundaresan",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Cyril Shroff",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Zia Mody",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Shardul Shroff",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Pallavi Shroff",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Bahram Vakil",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate J. Sagar",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Sujata Saxena",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Gautam Bhatia",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Karnika Seth",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Pavan Duggal",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Prashant Mali",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Mishi Choudhary",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Rahul Matthan",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Menaka Guruswamy",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Uday Bhat",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Amit Pai",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Bhim Singh",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Anand Sinha",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Rajesh Kumar",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Priya Sharma",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Poorvi Chothani",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Rajiv S. Khanna",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Shailesh Rai",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Veena Ralli",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Sumeet Malhotra",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Saahil Murli Menon",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate JV Bhosale",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Bhawana Pandey",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Sunita Bafna",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Chitra Bhanu Gupta",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Shiva Kumar Biradar",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Sudhir Reddy",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Gauravjit Singh Jaspal",
    "domain": "Criminal Law"
  },
  {
    "name": "Advocate Suresh Menon",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Vijay Verma",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Rajesh Sharma",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Neha Singh",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Amit Patel",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Kavita Reddy",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Sanjay Desai",
    "domain": "Civil Law"
  },
  {
    "name": "Advocate Tara Shetty",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Vinod Agarwal",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Kaveri Suresh",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Deepak Nath",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Sneha Pillai",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Balaji Naidu",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Chandrika Bhat",
    "domain": "Property Law"
  },
  {
    "name": "Advocate Pankaj Thakur",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Rita D'Souza",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Mohit Sinha",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Divya Krishnan",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Alok Mishra",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Sonal Shah",
    "domain": "Family Law"
  },
  {
    "name": "Advocate Prakash Rao",
    "domain": "Family Law"
  },
  {
    "name": "Advocate JSB Legal",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Juris Metrics",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Menon & Associates",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Marat Gogia",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate UR Legal",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Rajesh Kumar",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Priya Sharma",
    "domain": "Corporate Law"
  },
  {
    "name": "Advocate Vijay Verma",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Swati Reddy",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Deepak Nair",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Pooja Singh",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Rahul Deshmukh",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Geeta Bose",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Manoj Pillai",
    "domain": "Tax Law"
  },
  {
    "name": "Advocate Rahul Joshi",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Geeta Singh",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Kiran Mehta",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Ashok Kumar",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Nisha Devi",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Sunil Yadav",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Preeti Saxena",
    "domain": "Labour Law"
  },
  {
    "name": "Advocate Kavita Malhotra",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Rajesh Kumar",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Neha Singh",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Deepak Rao",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Swati Desai",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Manoj Pillai",
    "domain": "Cyber Law"
  },
  {
    "name": "Advocate Sunita lyer",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Deepak Malhotra",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Pooja Singh",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Rajesh Bose",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Swati Desai",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Manoj Pillai",
    "domain": "Consumer Protection Law"
  },
  {
    "name": "Advocate Rajeev Dhavan",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Indira Jaising",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Prashant Bhushan",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Dushyant Dave",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Gopal Subramanium",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Anand Grover",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Colin Gonsalves",
    "domain": "Constitutional Law"
  },
  {
    "name": "Advocate Sajai Singh",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Manisha Singh",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Rahul Ramakrishnan",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Raghul Sudheesh",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Anuradha Salhotra",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Swati Sharma",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Archana Shanker",
    "domain": "Intellectual Property Law (IPR)"
  },
  {
    "name": "Advocate Rajiv Luthra",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Mohit Saraf",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Nishith Desai",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Tej Hazarika",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Shilpa Kumar",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Arvind Datar",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Udayan Choksi",
    "domain": "Banking & Finance Law"
  },
  {
    "name": "Advocate Nehaa Chaudhari",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Nikhil Narendran",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Namita Viswanath",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Rajeev Chandrashekhar",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Malavika Rajkumar",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Anirudh Rastogi",
    "domain": "Media & IT Law"
  },
  {
    "name": "Advocate Anil Mehta",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Kavita lyer",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Suresh Patel",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Deepak Verma",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Neha Gupta",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Vijay Reddy",
    "domain": "Education Law"
  },
  {
    "name": "Advocate Rahul Chaudhary",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Priya Sarda",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Anjali Nayar",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Rajesh Kumar",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Priya Sharma",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Anil Mehta",
    "domain": "Immigration Law"
  },
  {
    "name": "Advocate Kavita lyer",
    "domain": "Immigration Law"
  }
];

module.exports = lawyersData;
