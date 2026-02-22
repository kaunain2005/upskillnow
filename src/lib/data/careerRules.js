export const careerRules = [

  // 1️⃣ Coding & Software Development
  {
    id: "software-development",
    title: "Software Development",
    branch: ["CS", "IT"],
    interest: "software-development",

    overview:
      "Software development focuses on designing, building, and maintaining scalable applications and systems.",

    whyThisCareer:
      "Perfect for students who enjoy logical thinking, coding, and solving real-world problems using technology.",

    roadmap: {
      FY: {
        focus: "Programming Basics",
        skills: ["C", "Java", "Python", "Logic Building"],
        projects: ["Calculator", "Student Record System"]
      },
      SY: {
        focus: "Core Development",
        skills: ["DSA", "OOP", "Git", "Web Basics"],
        projects: ["CRUD Web App", "API Project"]
      },
      TY: {
        focus: "Industry Readiness",
        skills: ["System Design", "Advanced DSA"],
        projects: ["Full Stack Final Project"]
      }
    },

    tools: ["VS Code", "GitHub", "Postman"],
    certifications: ["Coursera DSA", "NPTEL Programming"],
    careers: ["Software Engineer", "Full Stack Developer", "Backend Engineer"]
  },

  // 2️⃣ Data Analytics & Business Intelligence
  {
    id: "data-analytics",
    title: "Data Analytics & BI",
    branch: ["DS", "CS"],
    interest: "data-analytics",

    overview:
      "Data analytics converts raw data into actionable business insights using analytical and visualization tools.",

    whyThisCareer:
      "Ideal for students who enjoy working with data, numbers, and decision-making.",

    roadmap: {
      FY: {
        focus: "Data Foundations",
        skills: ["Statistics", "Excel"],
        projects: ["Sales Data Analysis"]
      },
      SY: {
        focus: "Data Tools",
        skills: ["Python", "SQL", "Data Cleaning"],
        projects: ["Dashboard Project"]
      },
      TY: {
        focus: "Advanced Analytics",
        skills: ["Power BI", "ML Basics"],
        projects: ["Industry Dataset Analysis"]
      }
    },

    tools: ["Excel", "Python", "Power BI"],
    certifications: ["Google Data Analytics"],
    careers: ["Data Analyst", "Business Analyst", "BI Developer"]
  },

  // 3️⃣ AI & Machine Learning
  {
    id: "ai-ml",
    title: "Artificial Intelligence & Machine Learning",
    branch: ["CS", "DS"],
    interest: "ai-ml",

    overview:
      "AI and ML focus on building intelligent systems that learn from data and automate decisions.",

    whyThisCareer:
      "Best for students interested in advanced technology, research, and future-focused careers.",

    roadmap: {
      FY: {
        focus: "Math & Python",
        skills: ["Python", "Linear Algebra"],
        projects: ["Simple Prediction Model"]
      },
      SY: {
        focus: "Machine Learning",
        skills: ["ML Algorithms", "Data Preprocessing"],
        projects: ["ML Mini Project"]
      },
      TY: {
        focus: "Advanced AI",
        skills: ["Deep Learning", "Model Optimization"],
        projects: ["AI-Based Final Project"]
      }
    },

    tools: ["Python", "TensorFlow", "Jupyter"],
    certifications: ["Coursera ML", "AICTE AI"],
    careers: ["ML Engineer", "AI Engineer", "Research Engineer"]
  },

  // 4️⃣ Web & UI/UX Design
  {
    id: "web-ui-ux",
    title: "Web & UI/UX Design",
    branch: ["CS", "IT"],
    interest: "web-ui-ux",

    overview:
      "Web and UI/UX design focuses on building visually appealing and user-friendly digital experiences.",

    whyThisCareer:
      "Ideal for creative students who enjoy design along with coding.",

    roadmap: {
      FY: {
        focus: "Design Basics",
        skills: ["HTML", "CSS", "Design Principles"],
        projects: ["Portfolio Website"]
      },
      SY: {
        focus: "Frontend Development",
        skills: ["JavaScript", "React"],
        projects: ["Responsive Website"]
      },
      TY: {
        focus: "UX & Performance",
        skills: ["UX Research", "Optimization"],
        projects: ["Product UI Redesign"]
      }
    },

    tools: ["Figma", "VS Code"],
    certifications: ["Google UX"],
    careers: ["Frontend Developer", "UI Designer", "UX Researcher"]
  },

  // 5️⃣ Cyber Security & Ethical Hacking
  {
    id: "cyber",
    title: "Cyber Security & Ethical Hacking",
    branch: ["CS", "IT"],
    interest: "cyber",

    overview:
      "Cyber security protects systems, networks, and data from cyber threats and attacks.",

    whyThisCareer:
      "Best for students interested in security, networking, and ethical hacking.",

    roadmap: {
      FY: {
        focus: "Networking Basics",
        skills: ["Networking", "Linux"],
        projects: ["Network Setup"]
      },
      SY: {
        focus: "Security Tools",
        skills: ["Ethical Hacking", "Firewalls"],
        projects: ["Vulnerability Assessment"]
      },
      TY: {
        focus: "Advanced Security",
        skills: ["SOC", "Incident Response"],
        projects: ["Security Audit Project"]
      }
    },

    tools: ["Wireshark", "Kali Linux"],
    certifications: ["CEH", "CompTIA Security+"],
    careers: ["Cyber Security Analyst", "SOC Analyst", "Ethical Hacker"]
  },

  // 6️⃣ Cloud Computing & DevOps
  {
    id: "cloud-devops",
    title: "Cloud Computing & DevOps",
    branch: ["CS", "IT"],
    interest: "cloud-devops",

    overview:
      "Cloud and DevOps focus on scalable infrastructure, automation, and deployment.",

    whyThisCareer:
      "Great for students interested in infrastructure, automation, and cloud platforms.",

    roadmap: {
      FY: {
        focus: "OS & Networking",
        skills: ["Linux", "Networking"],
        projects: ["Server Setup"]
      },
      SY: {
        focus: "Cloud Platforms",
        skills: ["AWS", "Docker"],
        projects: ["Cloud App Deployment"]
      },
      TY: {
        focus: "DevOps",
        skills: ["CI/CD", "Kubernetes"],
        projects: ["Automated Deployment Pipeline"]
      }
    },

    tools: ["AWS", "Docker", "GitHub Actions"],
    certifications: ["AWS Cloud Practitioner"],
    careers: ["Cloud Engineer", "DevOps Engineer", "SRE"]
  },

  // 7️⃣ Mobile App Development
  {
    id: "mobile-development",
    title: "Mobile App Development",
    branch: ["CS", "IT"],
    interest: "Mobile",

    overview:
      "Mobile app development focuses on building apps for Android and iOS platforms.",

    whyThisCareer:
      "Perfect for students interested in building real-world mobile applications.",

    roadmap: {
      FY: {
        focus: "Programming Basics",
        skills: ["Java", "Kotlin"],
        projects: ["Simple Android App"]
      },
      SY: {
        focus: "Cross-platform",
        skills: ["React Native", "Flutter"],
        projects: ["Mobile CRUD App"]
      },
      TY: {
        focus: "Advanced Apps",
        skills: ["API Integration", "Performance"],
        projects: ["Production-Level App"]
      }
    },

    tools: ["Android Studio", "Firebase"],
    certifications: ["Google Android"],
    careers: ["Android Developer", "iOS Developer", "Cross-platform Dev"]
  },

  // 8️⃣ Networking & System Administration
  {
    id: "networking",
    title: "Networking & System Administration",
    branch: ["IT"],
    interest: "networking",

    overview:
      "Networking roles manage and maintain IT infrastructure and systems.",

    whyThisCareer:
      "Ideal for students interested in core IT and infrastructure roles.",

    roadmap: {
      FY: {
        focus: "Basics",
        skills: ["Networking", "Hardware"],
        projects: ["LAN Setup"]
      },
      SY: {
        focus: "System Admin",
        skills: ["Linux", "Servers"],
        projects: ["Server Configuration"]
      },
      TY: {
        focus: "Enterprise Systems",
        skills: ["Cloud Networking"],
        projects: ["Enterprise Network Design"]
      }
    },

    tools: ["Cisco Packet Tracer"],
    certifications: ["CCNA"],
    careers: ["Network Engineer", "System Administrator", "IT Support Lead"]
  },

  // 9️⃣ Product & Tech Management
  {
    id: "product-management",
    title: "Product & Tech Management",
    branch: ["CS", "IT", "DS"],
    interest: "product-management",

    overview:
      "Product management bridges technology and business goals.",

    whyThisCareer:
      "Best for students with leadership and business mindset.",

    roadmap: {
      FY: {
        focus: "Business Basics",
        skills: ["Communication", "Documentation"],
        projects: ["Product Case Study"]
      },
      SY: {
        focus: "Product Skills",
        skills: ["Agile", "Roadmapping"],
        projects: ["Product Planning"]
      },
      TY: {
        focus: "Leadership",
        skills: ["Stakeholder Management"],
        projects: ["Product Launch Plan"]
      }
    },

    tools: ["Jira", "Notion"],
    certifications: ["Scrum Master"],
    careers: ["Product Manager", "Project Manager", "Tech Consultant"]
  },

  // 🔟 Startup & Freelancing
  {
    id: "startup-freelancing",
    title: "Startup & Freelancing",
    branch: ["CS", "IT", "DS"],
    interest: "startup-freelancing",

    overview:
      "Startups and freelancing focus on independent innovation and self-driven careers.",

    whyThisCareer:
      "Perfect for students who want flexibility, ownership, and innovation.",

    roadmap: {
      FY: {
        focus: "Skill Building",
        skills: ["Coding", "Design"],
        projects: ["Personal Portfolio"]
      },
      SY: {
        focus: "Client Work",
        skills: ["Freelancing Platforms"],
        projects: ["Client Project"]
      },
      TY: {
        focus: "Scaling",
        skills: ["Startup Strategy"],
        projects: ["Startup MVP"]
      }
    },

    tools: ["Upwork", "Fiverr"],
    certifications: ["Startup India"],
    careers: ["Startup Founder", "Freelancer", "Indie Developer"]
  }
];

export function getCareerById(id) {
  return careerRules.find((career) => career.id === id);
}
