"use strict";
const React = require("react");
const { render, Text } = require("ink");
const axios = require("axios");
const dayjs = require("dayjs");
const argv = require("minimist")(process.argv.slice(2));

function argvFormat(key = [], verifier = null) {
  let val = undefined;
  key.forEach((k) => {
    const curVal = argv[k];
    if (curVal) {
      if (verifier) {
        if (verifier(curVal)) {
          val = curVal;
        }
      } else {
        val = curVal;
      }
    }
  });
  return val;
}

function directList(list = [], reverse = false) {
  const newList = [...list];
  return reverse ? newList.reverse() : newList;
}

const Counter = () => {
  const [dataList, setDataList] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [latest, setLatest] = React.useState(dayjs().format("HH:mm:ss"));

  const _size = argvFormat(["s", "size"], (v) => v > 0 && v <= 100) || 10;
  const _interval = argvFormat(["i", "interval"], (v) => v > 1000) || 10000;
  const _reverse =
    argvFormat(["r", "reverse"], (v) => v !== undefined) || false;

  async function fetchData() {
    let res = [];
    if (isLoading) return;
    setIsLoading(true);
    try {
      res = await axios
        .get(`https://api.readhub.cn/topic?lastCursor=&pageSize=${_size}`)
        .then((d) => d.data);
    } catch (error) {}
    setLatest(dayjs().format("HH:mm:ss"));
    setIsLoading(false);
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      setDataList((dataList) => {
        let newDataList = [
          ...dataList.map((item) => ({ ...item, isNew: false })),
				];
				let d = res.data.reverse()
        d.forEach((item) => {
          if (
            item.id &&
            newDataList.findIndex(({ id }) => id === item.id) < 0
          ) {
            if (newDataList.length >= 10) newDataList = newDataList.splice(9);
            newDataList.unshift({ ...item, isNew: true });
          }
        });
        return newDataList;
      });
    }
  }

  React.useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      fetchData();
    }, _interval);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Text color="yellow">
        {`🕓  ${latest}`}
        {isLoading ? " ..." : ""}
      </Text>
      {directList(dataList, _reverse).map((item) => (
        <Text key={item.id} color={item.isNew ? "green" : "white"}>
          {`· ${item.title}`}
        </Text>
      ))}
    </>
  );
};

render(<Counter />);
