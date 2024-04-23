import { IoIosLogOut } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaRegSadCry, FaUsers, FaRegAngry, FaRegSurprise } from "react-icons/fa";
import { MdOutlineFeedback , MdOutlinePolicy, MdAutoStories } from "react-icons/md";
import { PiSmileyNervous } from "react-icons/pi";
import { BiHappyBeaming } from "react-icons/bi";
import { LiaAngry } from "react-icons/lia";

const globalData = {
  headerData: {
    logo: "Your Logo",
    dropdownButtons: [
      { id: 1, label: "Logout", icon: <IoIosLogOut /> },
      { id: 2, label: "Profile", icon: <CgProfile /> },
      { id: 3, label: "Settings", icon: <CiSettings /> }
    ]
  },
  footerData: {
    content: "Place sticky footer content here."
  },
  sidebarData: {
    items: [
      { id: 1, label: "Dashboard",  icon: <CgProfile /> },
      { id: 2, label: "Users",  icon: <FaUsers /> },
      { id: 'poemsHeading1', label: "Poems", isHeading: true },
      { id: 3, label: "Happiness",  icon: <BiHappyBeaming /> , subButton: true  },
      { id: 4, label: "Sadness",  icon: <FaRegSadCry /> , subButton: true  },
      { id: 5, label: "Fear",  icon: <PiSmileyNervous /> , subButton: true  },
      { id: 6, label: "Anger",  icon: <FaRegAngry /> , subButton: true  },
      { id: 7, label: "Surprise",  icon: <FaRegSurprise /> , subButton: true  },
      { id: 8, label: "Disgust",  icon: <LiaAngry /> , subButton: true  },
      { id: 'poemsHeading2', label: "Stories", isHeading: true },
      { id: 9, label: "Stories",  icon: <MdAutoStories />  , subButton: true },
      { id: 'poemsHeading3', label: "Settings", isHeading: true },
      { id: 10, label: "Feedback",  icon: <MdOutlineFeedback /> , subButton: true  },
      { id: 11, label: "Privacy policy",  icon: <MdOutlinePolicy /> , subButton: true  },
      { id: 12, label: "Terms & conditions",  icon: <CiSettings />  , subButton: true }
    ]
  }
};

export default globalData;


