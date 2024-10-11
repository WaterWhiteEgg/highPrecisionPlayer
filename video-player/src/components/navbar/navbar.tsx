import "./navbar.css";

function Navbar({ inputValue }) {
  return (
    <>
      <div className="nav">
        视频播放
        <div style={{color:"#7c7c7c",fontSize:".9rem"}}>
          <span style={{ margin: "0 2px" }}>精度数据</span> {inputValue}
        </div>
      </div>
    </>
  );
}

export default Navbar;
