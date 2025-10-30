import "./App.css";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import AddMeal from "./Components/AddMeal/AddMeal";
import ScanMeal from "./Components/AddMeal/ScanMeal";
import ActivityTracking from "./Components/ActivityTracking/ActivityTracking";
import EditMeal from "./Components/AddMeal/EditMeal";

import Diary from './Components/Diary/Diary';
import DailyLog from './Components/Diary/DailyLog';

//import Search from "./Components/Search/Search"

function App() {
  return (
    <div className="mobile-app-shell">
      <div className="mobile-section"><div className="page-frame"><LoginSignup /></div></div>
      <div className="mobile-section"><div className="page-frame"><Home /></div></div>
      <div className="mobile-section"><div className="page-frame"><AddMeal /></div></div>
      <div className="mobile-section"><div className="page-frame"><ScanMeal /></div></div>
      <div className="mobile-section"><div className="page-frame"><EditMeal /></div></div>

      {/* <Search/> */}

      <div className="mobile-section"><div className="page-frame"><ActivityTracking /></div></div>

      <div className="mobile-section"><div className="page-frame"><Diary/></div></div>
      <div className="mobile-section"><div className="page-frame"><DailyLog/></div></div>

      <div className="mobile-section"><div className="page-frame"><Profile /></div></div>
    </div>
  );
}

export default App;