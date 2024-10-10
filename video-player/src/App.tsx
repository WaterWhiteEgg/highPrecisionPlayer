import { useState, useRef, useEffect } from "react";
import Navbar from "./components/navbar/navbar";
import "./App.css";
import ReactPlayer from "react-player/lazy";

function App() {
  // 视频dom
  const playerRef = useRef(null);
  // 视频开关
  const [isPlay, setIsPlay] = useState(false);
  // 视频url
  const [url, setUrl] = useState(
    "https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218114723HDu3hhxqIT.mp4"
  );
  // 精度储存
  const [v, setV] = useState(100);
  // 计算宽高
  const [dimensions, setDimensions] = useState({ width: 640, height: 360 }); // 初始宽高
  const aspectRatio = dimensions.width / dimensions.height; // 计算初始宽高比
  // 拖动情况开关
  const [isMove, setIsMove] = useState(false);
  // 鼠标点下时
  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;
    // 拖动触发
    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const newHeight = newWidth / aspectRatio; // 根据宽高比计算新高度

      setDimensions({ width: newWidth, height: newHeight });
      // 拖动样式
      setIsMove(true);
    };
    // 鼠标弹起关闭监听
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      // 关闭拖动样式
      setIsMove(false);
    };
    // 持续监听
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // 输入框父组件的ref
  const inputsRef = useRef(null);
  // 时间值
  const [inputValue, setInputValue] = useState("");
  // 处理输入变化
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };
  // 格式字符串解析小时、分钟、秒和毫秒 成秒
  // 格式需要00.00.00.00
  function convertToSeconds(timeString: string) {
    // 用正则表达式匹配小时、分钟、秒和毫秒
    const regex = /(\d+)\.(\d+)\.(\d+)\.(\d+)/;
    const match = timeString.match(regex);

    if (!match) {
      throw new Error("时间格式错误");
    }

    // 提取小时、分钟、秒和毫秒
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const milliseconds = parseInt(match[4], 10);

    // 计算总秒数
    const totalSeconds =
      hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

    return totalSeconds;
  }
  // 秒级计算时间单位换算
  function formatTime(inputValue: number) {
    // 计算各个单位
    const hours = Math.floor(inputValue / 3600);
    const minutes = Math.floor((inputValue % 3600) / 60);
    const seconds = Math.floor(inputValue % 60);
    const milliseconds = Math.floor(
      (inputValue - Math.floor(inputValue)) * 1000
    ); // 处理小数部分

    // 创建一个数组用于存储结果
    const result = [];

    // 根据存在的单位拼接字符串
    if (hours > 0) {
      result.push(`${hours}小时`);
    }
    if (minutes > 0) {
      result.push(`${minutes}分钟`);
    }
    if (seconds > 0) {
      result.push(`${seconds}秒`);
    }
    if (milliseconds > 0) {
      result.push(`${milliseconds}毫秒`);
    }

    // 返回拼接后的字符串，若没有任何单位则返回“0”
    return result.length > 0 ? result.join(" ") : "0";
  }
  // 跳转时间段
  const jumpPoint = () => {
    playerRef.current.seekTo(inputValue, "seconds");
  };
  // 跳转精确时间段
  const jumpLinePoint = () => {
    setInputValue(convertToSeconds(getTimeString()).toString());
    playerRef.current.seekTo(Number(inputValue), "seconds");
  };

  // 获取所有子输入框的值
  const getTimeString = () => {
    if (inputsRef.current) {
      // 获取所有子输入框的值
      const hours =
        inputsRef.current.querySelector('input[type="number"]:nth-child(1)')
          .value || "0";
      const minutes =
        inputsRef.current.querySelector('input[type="number"]:nth-child(2)')
          .value || "0";
      const seconds =
        inputsRef.current.querySelector('input[type="number"]:nth-child(3)')
          .value || "0";
      const milliseconds =
        inputsRef.current.querySelector('input[type="number"]:nth-child(4)')
          .value || "0";

      // 返回格式化字符串
      return `${hours}.${minutes}.${seconds}.${milliseconds}`;
    }
    return "";
  };
  // 查看每一帧
  const goFrame = (isUp = true, long = 1000) => {
    const nowValue = Number(inputValue);

    console.log(nowValue);

    // 将 long 转换为秒
    const millisecondsToSeconds = long / 1000;

    // 根据 isUp 增加或减少 nowValue 的值
    const updatedValue = isUp
      ? nowValue + millisecondsToSeconds
      : nowValue - millisecondsToSeconds;
    // 确保 updatedValue 不会小于 0
    const newTime = Math.max(updatedValue, 0);

    playerRef.current.seekTo(newTime, "seconds");
  };
  // long值储存
  const [long, setLong] = useState(1000);

  // 获取当前视频时间
  const progress = (play) => {
    setInputValue(play.playedSeconds);
  };

  return (
    <>
      {/* 导航栏 */}
      <Navbar></Navbar>
      {/* 视图区 */}
      <div
        className={`player-wrapper ${isMove ? "move" : ""}`}
        onMouseDown={handleMouseDown}
      >
        <ReactPlayer
          ref={playerRef}
          className="react-player"
          url={url}
          playing={isPlay}
          controls
          width={`${dimensions.width}px`}
          height={`${dimensions.height}px`}
          progressInterval={v}
          onProgress={progress}
        ></ReactPlayer>
        <div className="player-system">
          <button
            onClick={() => {
              setIsPlay(!isPlay);
            }}
          >
            暂停/播放
          </button>
          <div>
            <button onClick={jumpPoint}>
              前进到 {formatTime(Number(inputValue))}
            </button>
            <input type="number" value={inputValue} onChange={handleChange} />
            <div>
              <div ref={inputsRef}>
                时<input type="number" />
                分<input type="number" />
                秒<input type="number" />
                毫秒
                <input type="number" />
              </div>
              <button onClick={jumpLinePoint}>精确前进</button>
            </div>
            <div>
              秒级查看
              <button
                onClick={() => {
                  goFrame(false, long);
                }}
              >
                ←
              </button>
              <button
                onClick={() => {
                  goFrame(true, long);
                }}
              >
                →
              </button>
              控制每一次距离（毫秒）
              <input
                type="number"
                value={long}
                onChange={(e) => {
                  setLong(Number(e.target.value));
                }}
              />
              <div>
                {/* 判断是否选择了高速监听 */}
                {v === 100 ? (
                  <button
                    onClick={() => {
                      setV(10);
                    }}
                  >
                    提升视频数据精度（增加卡顿）
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setV(100);
                    }}
                  >
                    返回正常
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            在线地址路径
            <textarea
              name=""
              id=""
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
