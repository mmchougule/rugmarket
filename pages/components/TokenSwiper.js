import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});

const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

export const TokenSwiper = ({ tokens, onSwipe }) => {
  const [gone] = useState(() => new Set());

  const [props, api] = useSprings(tokens.length, i => ({
    ...to(i),
    from: from(i),
  }));

  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2;
    const dir = xDir < 0 ? -1 : 1;
    if (!down && trigger) gone.add(index);
    api.start(i => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
      const scale = down ? 1.1 : 1;
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      };
    });
    if (!down && gone.size === tokens.length)
      setTimeout(() => {
        gone.clear();
        api.start(i => to(i));
      }, 600);
  });

  return (
    <div className="relative h-[500px] w-full max-w-[300px] mx-auto">
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className="absolute w-full h-full will-change-transform" key={i} style={{ x, y }}>
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${tokens[i].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="absolute w-full h-full rounded-xl shadow-xl cursor-grab active:cursor-grabbing"
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <h2 className="text-2xl font-bold">{tokens[i].id.toString()}</h2>
              <p className="text-lg">${tokens[i].price.toFixed(4)}</p>
            </div>
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
};