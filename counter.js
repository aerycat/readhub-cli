"use strict";
const React = require("react");
const { render, Text } = require("ink");
const axios = require("axios");
const dayjs = require("dayjs");
const argv = require("minimist")(process.argv.slice(2));
const pkg = require('./package.json')

const msUnit = 1000;

function argvFormat(key = [], verifier = null) {
  let val = null;
  key.forEach((k) => {
    const curVal = argv[k];
    if (curVal !== undefined) {
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

const _size = argvFormat(["s", "size"], (v) => v >= 1 && v <= 100);
const _interval = argvFormat(["i", "interval"], (v) => v >= 0);
const _reverse = argvFormat(["r", "reverse"]);
const iSize = _size === null ? 10 : parseInt(_size);
const iInterval =
  _interval === null ? 10 * msUnit : parseInt(_interval * msUnit);
const iReverse = !!_reverse;

let timer = null;

const checkHasNew = (nl, ol) => {
  let hasNew = false;
  const nll = nl.length;
  for (let i = 0; i < nll; i++) {
    if (nl[i].id && ol.findIndex(({ id }) => nl[i].id === id) < 0) {
      hasNew = true;
      break;
    }
  }
  return hasNew;
};

const Counter = () => {
  const [topics, setTopics] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [latest, setLatest] = React.useState(dayjs().format("HH:mm:ss"));
  const [newTopicsCount, setNewTopicsCount] = React.useState(0);

  const fetchData = async () => {
    let newTopics = [];
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await axios
        .get(`https://api.readhub.cn/topic?lastCursor=&pageSize=${iSize}`)
        .then((d) => d.data);
      newTopics = res && Array.isArray(res.data) ? res.data : [];
    } catch (error) {}

    let ntc = 0;

    if (newTopics.length > 0) {
      setTopics((topics) => {
        if (checkHasNew(newTopics, topics)) {
          return newTopics.map((newItem) => {
            const isNew =
              topics.findIndex((oldItem) => oldItem.id === newItem.id) < 0;
            ntc = ntc + (isNew ? 1 : 0);
            return {
              ...newItem,
              isNew,
            };
          }).sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        }
        return topics;
      });
    }
    setNewTopicsCount(ntc);
    setLatest(dayjs().format("HH:mm:ss"));
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
    if (iInterval) {
      timer = setInterval(() => {
        fetchData();
      }, iInterval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Text>
        <Text inverse color="green">
          &nbsp;READHUB v{pkg.version}&nbsp;
        </Text>
        <Text inverse color="yellow">
          &nbsp;
          {latest}
          &nbsp;
        </Text>
        {newTopicsCount > 0 && (
          <>
            <Text inverse color="red">
              &nbsp;{newTopicsCount}&nbsp;
            </Text>
          </>
        )}
        {isLoading ? " ..." : ""}
      </Text>
      {directList(topics, iReverse).map((item) => (
        <Text key={item.id} color={item.isNew ? "green" : "white"}>
          {`· ${item.title}`}
        </Text>
      ))}
    </>
  );
};

render(<Counter />);
