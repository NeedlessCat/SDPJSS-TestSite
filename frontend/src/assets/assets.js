import devi from "./devi1f.png";
import logo from "./myLogo.png";
import about from "./about.png";
import profile from "./profile.png";
import group_profiles from "./group_profiles.png";
import dropdown_icon from "./dropdown_icon.svg";
import menu_icon from "./menu_icon.svg";
import cross_icon from "./cross_icon.png";
import chats_icon from "./chats_icon.svg";
import verified_icon from "./verified_icon.svg";
import arrow_icon from "./arrow_icon.svg";
import info_icon from "./info_icon.svg";
import upload_icon from "./upload_icon.png";
import heroImg from "./myHeroImg.jpeg";
import familyLogo from "./family_logo.png";
import female from "./female.png";
import male from "./male.png";

import Balram from "./team/Balram.jpeg";
import Bengali from "./team/Bengali.jpeg";
import Bhuneshwar from "./team/Bhuneshwar.jpeg";
import Damodar from "./team/Damodar.jpeg";
import Dolleshwar from "./team/Dolleshwar.png";
import Dukhan from "./team/Dukhan.jpeg";
import Dwarika from "./team/Dwarika.jpeg";
import Gendlal from "./team/Gendlal.jpeg";
import Horendra from "./team/Horendra.jpeg";
import Hulashchandra from "./team/Hulashchandra.jpeg";
import Jitendra from "./team/Jitendra.png";
import Khemchand from "./team/Khemchand.jpeg";
import Khowalal from "./team/Khowalal.jpeg";
import Kishunchand from "./team/Kishunchand.jpeg";
import Krishna from "./team/Krishna.jpeg";
import Nagendra from "./team/Nagendra.jpeg";
import Pawan from "./team/Pawan.jpeg";
import Pokhraj from "./team/Pokhraj.jpeg";
import Pramod from "./team/Pramod.jpeg";
import Ravindra from "./team/Ravindra.jpeg";
import Satish from "./team/Satish.jpeg";
import Suraj from "./team/Suraj.png";
import Vijay from "./team/Vijay.jpeg";

import {
  Users,
  UserPlus,
  Briefcase,
  ScrollText,
  Heart,
  GanttChartSquare,
} from "lucide-react";

import {
  Calendar,
  AlertTriangle,
  Info,
  Award,
  BookOpen,
  Zap,
} from "lucide-react";

import { Bell, Star, Sun, Coffee, Gift } from "lucide-react";
import { color } from "framer-motion";

export const assets = {
  devi,
  logo,
  about,
  profile,
  group_profiles,
  dropdown_icon,
  menu_icon,
  cross_icon,
  chats_icon,
  verified_icon,
  arrow_icon,
  info_icon,
  upload_icon,
  heroImg,
  familyLogo,
  female,
  male,
};

export const services = [
  {
    title: "Staff Requirement",
    icon: Briefcase,
    description: "View current staff openings and requirements",
    gradient: "from-red-600 to-red-300",
    page: "/staffs-page",
  },
  {
    title: "Job Requirement",
    icon: ScrollText,
    description: "Browse available job opportunities",
    gradient: "from-red-900 to-red-600",
    page: "/jobs-page",
  },
  {
    title: "Advertisement",
    icon: Heart,
    description: "Get List of all the Sales and discounts in the market",
    gradient: "from-red-700 to-red-400",
    page: "/advertisements-page",
  },
];

export const notices = [
  {
    id: 1,
    title: "System Maintenance Scheduled",
    message:
      "Our servers will undergo maintenance tonight from 2:00 AM to 4:00 AM. Expect brief service interruptions.",
    time: "30 min ago",
    icon: AlertTriangle,
    color: "text-red-500",
    type: "alert",
    priority: "high",
    isRead: false,
    author: "System Admin",
    category: "technical",
  },
  {
    id: 2,
    title: "New Feature Launch: Dark Mode",
    message:
      "We're excited to announce the launch of dark mode! Toggle it in your settings to reduce eye strain during late-night sessions.",
    time: "2 hours ago",
    icon: Zap,
    color: "text-purple-500",
    type: "announcement",
    priority: "medium",
    isRead: false,
    author: "Product Team",
    category: "feature",
  },
  {
    id: 3,
    title: "Community Meetup - Tech Talk Series",
    message:
      "Join us this Friday at 6 PM for our monthly tech talk. This month's topic: 'Building Scalable React Applications'.",
    time: "4 hours ago",
    icon: Calendar,
    color: "text-blue-500",
    type: "event",
    priority: "medium",
    isRead: true,
    author: "Event Coordinator",
    category: "community",
  },
  {
    id: 4,
    title: "Congratulations to Top Contributors!",
    message:
      "Shoutout to our amazing community members who contributed the most this month. Your dedication makes our platform better!",
    time: "1 day ago",
    icon: Award,
    color: "text-yellow-500",
    type: "achievement",
    priority: "low",
    isRead: true,
    author: "Community Manager",
    category: "recognition",
  },
  {
    id: 5,
    title: "New Learning Resources Available",
    message:
      "We've added 15 new tutorials to our learning center covering advanced JavaScript concepts and best practices.",
    time: "2 days ago",
    icon: BookOpen,
    color: "text-green-500",
    type: "info",
    priority: "medium",
    isRead: false,
    author: "Education Team",
    category: "resources",
  },
  {
    id: 6,
    title: "Security Update: Two-Factor Authentication",
    message:
      "For enhanced security, we now support 2FA. We highly recommend enabling it in your account settings.",
    time: "3 days ago",
    icon: Info,
    color: "text-indigo-500",
    type: "announcement",
    priority: "high",
    isRead: true,
    author: "Security Team",
    category: "security",
  },
  {
    id: 7,
    title: "Welcome New Team Members!",
    message:
      "Please join us in welcoming Sarah, Mike, and Alex to our growing team. They'll be focusing on user experience improvements.",
    time: "5 days ago",
    icon: Users,
    color: "text-pink-500",
    type: "announcement",
    priority: "low",
    isRead: true,
    author: "HR Team",
    category: "team",
  },
  {
    id: 8,
    title: "Community Feedback Survey",
    message:
      "Help us improve! Take our 5-minute survey to share your thoughts on recent updates and suggest new features.",
    time: "1 week ago",
    icon: Heart,
    color: "text-rose-500",
    type: "info",
    priority: "medium",
    isRead: false,
    author: "Product Team",
    category: "feedback",
  },
  {
    id: 9,
    title: "Platform Milestone: 10K Active Users!",
    message:
      "We've reached an incredible milestone of 10,000 active users! Thank you for being part of our amazing community.",
    time: "1 week ago",
    icon: Star,
    color: "text-amber-500",
    type: "achievement",
    priority: "medium",
    isRead: true,
    author: "Founder",
    category: "milestone",
  },
  {
    id: 10,
    title: "Weekly Newsletter Available",
    message:
      "This week's newsletter covers industry trends, platform updates, and featured community projects. Check your inbox!",
    time: "1 week ago",
    icon: Bell,
    color: "text-cyan-500",
    type: "info",
    priority: "low",
    isRead: true,
    author: "Marketing Team",
    category: "newsletter",
  },
];

export const team1 = [
  {
    name: "Jitendra Prasad",
    image: Jitendra,
    post: "Chairman",
  },
  {
    name: "Dolleshwar Prasad",
    image: Dolleshwar,
    post: "Vice-chairman",
  },
  {
    name: "Suraj Kumar",
    image: Suraj,
    post: "Vice-chairman",
  },
];
export const team2 = [
  {
    name: "Pramod Kumar",
    image: Pramod,
    post: "President",
  },
  {
    name: "Bengali Prasad",
    image: Bengali,
    post: "Vice-president",
  },
  {
    name: "Nagendra Prasad",
    image: Nagendra,
    post: "Vice-president",
  },
];
export const team3 = [
  {
    name: "Krishna Prasad",
    image: Krishna,
    post: "Main-Secratory",
  },
  {
    name: "Dwarika Prasad",
    image: Dwarika,
    post: "Secratory",
  },
  {
    name: "Kishunchand Prasad",
    image: Kishunchand,
    post: "Secratory",
  },
  {
    name: "Damodar Prasad",
    image: Damodar,
    post: "Secratory",
  },
];

export const team4 = [
  {
    name: "Hulashchandra Prasad",
    image: Hulashchandra,
    post: "Main Cashier",
  },
  {
    name: "Vijay Kumar",
    image: Vijay,
    post: "Cashier",
  },
];
export const team5 = [
  {
    name: "Bhuneshwar Prasad",
    image: Bhuneshwar,
    post: "Consultant",
  },
  {
    name: "Dukhan Prasad",
    image: Dukhan,
    post: "Consultant",
  },
  {
    name: "Horendra Prasad",
    image: Horendra,
    post: "Consultant",
  },
  {
    name: "Khemchand Prasad",
    image: Khemchand,
    post: "Consultant",
  },
  {
    name: "Khowa Lal",
    image: Khowalal,
    post: "Consultant",
  },
  {
    name: "Pawan Kumar",
    image: Pawan,
    post: "Consultant",
  },
  {
    name: "Pokhraj Prasad",
    image: Pokhraj,
    post: "Consultant",
  },
  {
    name: "Ravindra Prasad",
    image: Ravindra,
    post: "Consultant",
  },
  {
    name: "Gend Lal",
    image: Gendlal,
    post: "Consultant",
  },
];
export const team6 = [
  {
    name: "Gend Lal",
    image: Gendlal,
    post: "Instructor & Developer",
  },
  {
    name: "Satish Kumar",
    image: Satish,
    post: "B.Tech. Engg. (Solution Architect, Cognizant)",
  },
  {
    name: "Advocate Balram Patwa",
    image: Balram,
    post: "B.Com LLB(Hons.),(Gold Medalist)",
  },
];

export const family = [
  {
    fid: "7",
    fname: "Khemchand Prasad",
    faddress: "Manpur Dakgharlane, PO: Buniyadganj, Gaya. Bihar - 823003",
    gotra: "Vashiya - Patwa",
    email: "kumar29.aayush@gmail.com",
    mobile: "+91 8210701450",
    members: [
      {
        id: "1001",
        name: "Bhuneshwar Prasad",
        fid: "1000",
        mother: "Parvati Devi",
        gender: "male",
        dob: "12-03-1980",
        blood: "B+",
      },
      {
        id: "1002",
        name: "Radha Devi",
        fid: "1000",
        mother: "Parvati Devi",
        gender: "female",
        dob: "12-03-1977",
        blood: "B+",
      },
    ],
  },
  {
    fid: "6",
    fname: "Dhalchand Prasad",
    faddress: "Manpur Dakgharlane, PO: Buniyadganj, Gaya. Bihar - 823003",
    gotra: "Brahmin - Patwa",
    email: "kumar29.aayush@gmail.com",
    mobile: "+91 8210701450",
    members: [
      {
        id: "1001",
        name: "Bhuneshwar Prasad",
        fid: "1000",
        mother: "Parvati Devi",
        gender: "male",
        dob: "12-03-1980",
        blood: "B+",
      },
      {
        id: "1002",
        name: "Radha Devi",
        fid: "1000",
        mother: "Parvati Devi",
        gender: "female",
        dob: "12-03-1977",
        blood: "B+",
      },
    ],
  },
];
