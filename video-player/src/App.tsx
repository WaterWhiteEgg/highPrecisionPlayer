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
  const [url, setUrl] = useState("http://vjs.zencdn.net/v/oceans.mp4");
  // 精度储存
  const [v, setV] = useState(100);
  // 计算宽高
  const [dimensions, setDimensions] = useState({ width: 640, height: 360 }); // 初始宽高
  const aspectRatio = dimensions.width / dimensions.height; // 计算初始宽高比
  // 拖动情况开关
  const [isMove, setIsMove] = useState(false);
  // 拖动文件情况开关
  const [isMoveFile, setIsMoveFile] = useState(false);
  // 鼠标点下时
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;
    // 拖动触发
    const onMouseMove = (moveEvent: MouseEvent) => {
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
  // 关于react的渲染机制，如果你需要一个持续使用的函数，直接使用
  // inputValue是不会改变的，因为在
  // 那个函数没有删除的情况下inputValue他的值不会重新渲染，外层的inputValue
  // 已经变化了都是这样，所以尝试给他一个动态的值而不是定义的数值，可使用ref
  // 封装inputValue，同时让其监听inputValue最新的值，这个inputValueRef.current
  // 对于react来说没有固定的值，需要每次都获取最新的值
  const inputValueRef = useRef(inputValue);

  
    // 在 inputValue 更新时更新 ref
    useEffect(() => {
      inputValueRef.current = inputValue;
  }, [inputValue]);

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
  // 秒级单位ref
  const secondInputRef = useRef(null);
  // 跳转时间段
  const jumpPoint = () => {
    playerRef.current.seekTo(Number(secondInputRef.current.value), "seconds");
    return secondInputRef.current.value + "秒";
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
    const nowValue = Number(inputValueRef.current); // 使用 ref 获取最新的 inputValue
    console.log(inputValue);

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
  // 获取本地文件
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 创建一个本地 URL
      const fileURL = URL.createObjectURL(file);
      setUrl(fileURL);
    }
  };

  // 处理拖放进来的事件
  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const fileURL = URL.createObjectURL(file);
      setUrl(fileURL);
    }
    // 关闭拖拽布尔值
    setIsMoveFile(false);
  };

  // 处理拖拽进入区域
  const handleDragOver = (event) => {
    event.preventDefault(); // 防止浏览器打开文件
    // 开启拖拽布尔值
    setIsMoveFile(true);
  };
  // 处理拖拽离开区域
  const handleDragLeave = (event) => {
    // 关闭拖拽布尔值
    setIsMoveFile(false);
  };

  // 键盘点击事件
  const handleKeyPress = (event) => {
    switch (event.code) {
      case "Space":
        event.preventDefault(); // 阻止默认的空格行为（如滚动页面）
        setIsPlay((prev) => !prev); // 切换播放/暂停状态
        break;
      case "ArrowLeft":
        event.preventDefault(); // 阻止默认的空格行为（如滚动页面）
        goFrame(false, long); // 左箭头
        break;
      case "ArrowRight":
        event.preventDefault(); // 阻止默认的空格行为（如滚动页面）
        goFrame(true, long); // 右箭头
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress); // 组件卸载时移除事件监听
    };
  }, []);
  return (
    <>
      {/* 导航栏 */}
      <Navbar inputValue={inputValue}></Navbar>
      {/* 视图区 */}
      <div
        className={`player-wrapper ${isMove ? "move" : ""} ${
          isMoveFile ? "fmove" : ""
        } `}
        onMouseDown={handleMouseDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
          <div className="player-system-1">
            <div className="player-system-1-play">
              <button
                onClick={() => {
                  setIsPlay(!isPlay);
                }}
              >
                暂停/播放
              </button>
            </div>
            <div className="player-system-1-run">
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
              <strong style={{ margin: "0 5px" }}>
                time(秒): {formatTime(Number(inputValue))}
              </strong>
              <div>
                {/* 判断是否选择了高速监听 */}
                {v === 100 ? (
                  <button
                    onClick={() => {
                      setV(10);
                    }}
                    style={{ fontSize: ".8rem" }}
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
          <div className="player-system-2">
            <div>
              <button onClick={jumpPoint}>
                前进到 {secondInputRef?.current?.value || 0} 秒
              </button>
              <input type="number" ref={secondInputRef} />
            </div>
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
          </div>
          <div
            className="player-system-3"
            onMouseDown={(e) => e.stopPropagation()} // 阻止事件冒泡
          >
            输入<strong> 在线地址路径</strong> 或 <strong>拖拽视频</strong>{" "}
            到网页里
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
            ></input>
            <input
              type="file"
              accept="video/*" // 只接受视频文件
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
