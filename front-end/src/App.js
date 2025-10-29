import './App.css';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import Home from './Components/Home/Home';
import Profile from './Components/Profile/Profile';
import AddMeal from './Components/ScanFood/AddMeal';
import ScanMeal from './Components/ScanFood/ScanMeal';
import ActivityTracking from "./Components/ActivityTracking/ActivityTracking"

import Diary from './Components/Diary/Diary';
import DailyLog from './Components/Diary/DailyLog';

//import Search from "./Components/Search/Search"


function App() {
  return (
    <div>
      <LoginSignup/> 
      <Home/> 
      <AddMeal/>
      <ScanMeal/>

      {/* <Search/> */}
      <ActivityTracking/>

      <Diary/> 
      <DailyLog/> 

      <Profile/>
      

    </div>
  );
}

export default App;