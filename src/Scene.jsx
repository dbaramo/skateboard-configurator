import { useRef, useState, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import {
  CameraControls,
  Html,
  Environment,
  useTexture,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import gsap from "gsap";

import { deckInfo, trucksInfo, wheelsInfo } from "./info";

import Deck from "./Skateboard/Deck";
import Top from "./HTML/Top";
import Detail from "./HTML/Detail";
import SectionHeadline from "./HTML/SectionHeadline";
import TrucksHtml from "./HTML/TrucksHtml";
import WheelsHtml from "./HTML/WheelsHtml";
import FinishSection from "./HTML/FinishSection";
import RotateIcon from "./HTML/RotateIcon";

const texture_urls = wheelsInfo.map((w) => w.texture_url);

export default function Scene({ canvasContainerRef }) {
  const touchDevice = "ontouchstart" in document.documentElement;

  const positions = [];
  const trucksHtmlPositions = [];
  const wheelRotations = [];
  const wheelsHtmlPositions = [];
  const trucksGap = 0.4;
  const wheelsGap = 0.35;

  const cameraControlsRef = useRef();
  const prevTouchX = useRef(null);

  const meshGroupRef = useRef();
  const topHtmlGroupRef = useRef();
  const bottomGroupHtmlRef = useRef();
  const detailSelectContainerRef = useRef();
  const trucksGroupContainerRef = useRef();
  const wheelsGroupContainerRef = useRef();
  const detailGroupRef = useRef();
  const wheelUniformRef = useRef(null);
  const scrollTimeout = useRef();
  const gsapCtx = useRef();

  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [currentTruckIndex, setCurrentTruckIndex] = useState(0);
  const [currentWheelIndex, setCurrentWheelIndex] = useState(0);
  const [cameraActive, setCameraActiveStatus] = useState(false);
  const [currentSection, setCurrentSection] = useState("board");
  const [headlineText, setHeadlineText] = useState("Choose your board");
  const [selections, addSelection] = useState([]);
  const [rotatePreview, setRotatePreview] = useState(false);

  const { camera, scene } = useThree();
  const wheelTextures = useTexture(texture_urls);

  const finalQ = new THREE.Quaternion();

  useEffect(() => {
    cameraControlsRef.current._removeAllEventListeners();

    cameraControlsRef.current.addEventListener("rest", () => {
      snapScroll();
    });

    document.addEventListener("wheel", scrollAction);

    document.addEventListener("touchstart", touchStart);
    document.addEventListener("touchmove", scrollAction);

    return () => {
      document.removeEventListener("wheel", scrollAction);

      document.removeEventListener("touchstart", touchStart);
      document.removeEventListener("touchmove", scrollAction);
    };
  }, [currentSection, rotatePreview]);

  useEffect(() => {
    gsapCtx.current.introAnimation();
    wheelTextures.forEach((t) => {
      t.needsUpdate = true;
      t.flipY = false;
    });
  }, []);

  useLayoutEffect(() => {
    gsapCtx.current = gsap.context((self) => {
      const introTL = gsap.timeline();
      const boardMaterials = meshGroupRef.current.children.map(
        (g) => g.children[0].material
      );

      self.add("introAnimation", () => {
        introTL
          .to(boardMaterials, {
            opacity: 1,
            ease: "power2.out",
            duration: 1,
          })
          .to(
            meshGroupRef.current.position,
            {
              z: 0,
              ease: "power2.out",
              duration: 1,
            },
            0
          )
          .to(
            ".section-headline-container",
            {
              opacity: 1,
              ease: "power2.out",
              duration: 1,
            },
            0
          )
          .to(
            ".info-container",
            {
              opacity: 1,
              ease: "power2.out",
              duration: 1,
            },
            0
          )
          .to(
            topHtmlGroupRef.current.children[1].position,
            {
              y: -0.07,
              ease: "power2.out",
              duration: 1,
            },
            0
          )
          .to(
            bottomGroupHtmlRef.current.position,
            {
              y: -0.55,
              ease: "power2.out",
              duration: 1,
            },
            0
          );
      });
      self.add("boardToTrucksTransition", (deckIndex) => {
        const tl = gsap.timeline();
        const currentDeckGroup = meshGroupRef.current.children[deckIndex];
        const trucksGroup = currentDeckGroup.children[1];
        const trucksMaterials = [
          trucksGroup.children[0].children[0].material,
          trucksGroup.children[0].children[1].material,
        ];

        const boardsToRemoveMaterial = boardMaterials.filter(
          (m, i) => i !== deckIndex
        );
        const sectionLabels = document.getElementById(
          "section-label-container"
        ).children;

        tl.to(boardsToRemoveMaterial, {
          opacity: 0,
          ease: "power2.in",
          duration: 0.5,
          onComplete: () => {
            meshGroupRef.current.children = [currentDeckGroup];
          },
        })
          .to(
            ".section-headline-container",
            {
              opacity: 0,
              ease: "power2.in",
              duration: 0.5,
              onComplete: function () {
                setHeadlineText("Choose your trucks");
              },
            },
            0.4
          )
          .to(
            ".info-container",
            {
              opacity: 0,
              ease: "power2.in",
              duration: 0.5,
            },
            "<"
          )
          .to(
            topHtmlGroupRef.current.children[1].position,
            {
              y: -0.1,
              ease: "power2.in",
              duration: 0.5,
              onComplete: () => {
                topHtmlGroupRef.current.children[1].position.y = -0.07;
              },
            },
            "<"
          )
          .to(
            bottomGroupHtmlRef.current.position,
            {
              y: -0.54,
              ease: "power2.in",
              duration: 0.5,
            },
            "<"
          )
          .to(currentDeckGroup.rotation, {
            x: -Math.PI / 2,
            ease: "power3.out",
            duration: 0.9,
          })
          .to(
            ".info-container",
            {
              display: "none",
            },
            "<"
          )
          .to(
            currentDeckGroup.position,
            {
              x: cameraControlsRef.current.camera.position.x,
              z: 3,
              y: -0.1,
              duration: 0.9,
            },
            "<"
          )
          .to(
            sectionLabels[1],
            {
              color: "rgb(0 0 0)",
            },
            "<"
          )
          .to(
            sectionLabels[0],
            {
              color: "rgb(209 213 219)",
              onComplete: () => sectionLabels[0].classList.remove("text-black"),
            },
            "<"
          )
          .to(
            trucksMaterials,
            {
              duration: 1.2,
              onComplete: () => {
                detailSelectContainerRef.current.classList.remove("hidden");
                const detailContainer =
                  document.getElementById("detail-container");
                const nameEl = detailContainer.children[0];
                const priceEl = detailContainer.children[1];
                nameEl.textContent = trucksInfo[0].name;
                priceEl.textContent = trucksInfo[0].price;
              },
              ease: "power3.out",
            },
            "<"
          )
          .to(
            trucksGroup.position,
            {
              z: 0,
              duration: 1,
              ease: "power3.out",
              onStart: () => {
                trucksGroup.visible = true;
              },
            },
            ">-25%"
          )
          .to(
            ".section-headline-container",
            {
              opacity: 1,
              ease: "power2.out",
              duration: 1.5,
            },
            "<"
          )
          .to(
            [".trucks-info-container", "#top-select-btn"],
            {
              display: "block",
              duration: 0,
            },
            "<"
          )
          .to(
            [".trucks-info-container", "#top-select-btn", "#detail-container"],
            {
              opacity: 1,
              ease: "power2.out",
              duration: 1.5,
            },
            "<"
          );
      });

      self.add("scrollPosX", (items, xDelta) => {
        gsap.to([...items], {
          x: xDelta,
          duration: 0.1,
        });
      });

      self.add("scrollTrucks", (snapIndex) => {
        const trucksGroup = scene.children[1].children[0].children[1];
        const trucksHtmlContainers = document.querySelectorAll(
          ".trucks-info-container"
        );
        const notSelectedHtml = [];
        let selected = null;
        const detailContainer = document.getElementById("detail-container");
        const nameEl = detailContainer.children[0];
        const priceEl = detailContainer.children[1];

        trucksHtmlContainers.forEach((c) => {
          const cIndex = Number(c.attributes["index"].value);

          if (cIndex !== snapIndex) {
            notSelectedHtml.push(c);
          }
          if (cIndex === snapIndex) selected = c;
        });

        const tl = gsap.timeline();
        tl.to(trucksGroup.position, {
          x: snapIndex * -0.4,
          duration: 0.5,
        })
          .to(
            trucksGroupContainerRef.current.position,
            {
              x: -trucksHtmlPositions[snapIndex],
              duration: 0.5,
            },
            0
          )
          .to(
            [nameEl, priceEl],
            {
              opacity: 0,
              onComplete: () => {
                nameEl.textContent = trucksInfo[snapIndex].name;
                priceEl.textContent = trucksInfo[snapIndex].price;
              },
            },
            0
          )
          .to([nameEl, priceEl], {
            opacity: 1,
          });
      });

      self.add("trucksToWheelsTransition", () => {
        const detailContainer = document.getElementById("detail-container");
        const nameEl = detailContainer.children[0];
        const priceEl = detailContainer.children[1];

        const sectionLabels = document.getElementById(
          "section-label-container"
        ).children;
        const currentBoardGroup = meshGroupRef.current.children[0];
        const tl = gsap.timeline();
        const currentCameraPosX = cameraControlsRef.current.camera.position.x;
        const wheelsGroup =
          currentBoardGroup.children[1].children[0].children[2];
        const finalWheelGroupPosX = wheelsGroup.position.x;
        const finalRotation = wheelsGroup.children[3].rotation.x;
        wheelsGroup.children[3].rotation.x = finalRotation + -0.7854;

        tl.to(
          [
            ".section-headline-container",
            ".t-html-container",
            "#top-select-btn",
            detailContainer,
          ],
          {
            opacity: 0,
            onComplete: () => {
              setHeadlineText("Choose your wheels");
            },
          }
        )
          .to(".t-html-container", {
            display: "none",
            duration: 0,
          })
          .to(".wheels-info-container", {
            display: "block",
            duration: 0,
          })
          .to(currentBoardGroup.rotation, {
            z: Math.PI / 2,
            onStart: () => {
              wheelsGroup.visible = true;
              wheelsGroup.position.x = wheelsGroup.position.x - 0.4;
            },
          })
          .to(
            [
              ".section-headline-container",
              ".wheels-info-container",
              "#top-select-btn",
              detailContainer,
            ],
            {
              opacity: 1,
              onStart: () => {
                detailGroupRef.current.position.y = -0.46;
                nameEl.textContent = wheelsInfo[0].name;
                priceEl.textContent = wheelsInfo[0].price;
              },
            },
            "<"
          )
          .to(
            currentBoardGroup.position,
            {
              x: currentCameraPosX + 0.26,
              z: 4.2,
            },
            "<"
          )
          .to(
            sectionLabels[2],
            {
              color: "rgb(0 0 0)",
            },
            "<"
          )
          .to(
            sectionLabels[1],
            {
              color: "rgb(209 213 219)",
            },
            "<"
          )
          .to(wheelsGroup.position, {
            x: finalWheelGroupPosX,
          })
          .to(
            wheelsGroup.children[3].rotation,
            {
              x: finalRotation,
            },
            "<"
          );
      });

      self.add("scrollWheels", (snapIndex) => {
        const detailContainer = document.getElementById("detail-container");
        const nameEl = detailContainer.children[0];
        const priceEl = detailContainer.children[1];

        wheelUniformRef.current.texture2.value = wheelTextures[snapIndex];
        const wheel =
          meshGroupRef.current.children[0].children[1].children[0].children[2]
            .children[3];

        const tl = gsap.timeline();
        tl.to(wheelsGroupContainerRef.current.position, {
          x: -wheelsHtmlPositions[snapIndex],
          duration: 0.5,
        })
          .to(
            wheelUniformRef.current.mixValue,
            {
              value: 1,

              onComplete: () => {
                wheelUniformRef.current.texture1.value =
                  wheelTextures[snapIndex];
                wheelUniformRef.current.mixValue.value = 0;
              },
            },
            0
          )
          .to(
            wheel.rotation,
            {
              x: wheelRotations[snapIndex],
              duration: 0.5,
            },
            0
          )
          .to(
            [nameEl, priceEl],
            {
              opacity: 0,
              onComplete: () => {
                nameEl.textContent = wheelsInfo[snapIndex].name;
                priceEl.textContent = wheelsInfo[snapIndex].price;
              },
            },
            0
          )
          .to([nameEl, priceEl], {
            opacity: 1,
          });
      });
      self.add("wheelsToFinishTransition", () => {
        const currentBoardGroup = meshGroupRef.current.children[0];
        const tl = gsap.timeline();

        const sectionLabels = document.getElementById(
          "section-label-container"
        ).children;

        tl.to(
          [
            detailSelectContainerRef.current,
            ".section-headline-container",
            ".w-html-container",
          ],
          {
            opacity: 0,
            onComplete: () => setHeadlineText("Your skateboard"),
          }
        )

          .to(
            ".finish-section",
            {
              display: "block",
              duration: 0,
            },
            0
          )
          .to(currentBoardGroup.rotation, {
            x: 0,
            z: 0,
            ease: "expo.out",
            duration: 1.5,
          })
          .to(
            currentBoardGroup.rotation,
            {
              y: Math.PI * 2.05,
              duration: 2,
              ease: "power4.out",
            },
            "<"
          )
          .to(
            sectionLabels[3],
            {
              color: "rgb(0 0 0)",
            },
            "<"
          )
          .to(
            sectionLabels[2],
            {
              color: "rgb(209 213 219)",
            },
            "<"
          )

          .to(
            currentBoardGroup.position,
            {
              x: cameraControlsRef.current.camera.position.x,

              z: 2,
              duration: 0.5,
            },
            "<"
          )
          .to(currentBoardGroup.position, {
            y: -0.45,
            onComplete: () => {
              finalQ.copy(currentBoardGroup.quaternion);
            },
          })

          .to(
            [".section-headline-container", ".finish-section"],
            {
              opacity: 1,
            },
            "<"
          )
          .to(
            ".rotate-icon-wrapper",
            {
              display: "block",
            },
            "<"
          )
          .to(".rotate-icon-wrapper", {
            opacity: 1,
          });
      });

      self.add("toggleRotationPreview", (rPreviewState) => {
        const currentBoardGroup = meshGroupRef.current.children[0];
        const tl = gsap.timeline();
        if (rPreviewState === false) {
          tl.to(".finish-section", {
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
          }).to(
            currentBoardGroup.position,
            {
              y: 0,
              z: 0,
              duration: 0.5,
              ease: "power3.out",
            },
            0
          );
        } else {
          tl.to(currentBoardGroup.position, {
            y: -0.45,
            z: 2,
            duration: 0.5,
            ease: "power3.in",
          })
            .to(
              currentBoardGroup.quaternion,
              {
                x: finalQ.x,
                y: finalQ.y,
                z: finalQ.z,
                w: finalQ.w,
                duration: 0.5,
                ease: "power3.in",
              },
              0
            )
            .to(
              ".finish-section",
              {
                opacity: 1,
                duration: 0.5,
                ease: "power3.in",
              },
              0.1
            );
        }
        setRotatePreview(!rPreviewState);
      });
    });

    return () => gsapCtx.current.revert();
  }, []);

  function touchStart(e) {
    prevTouchX.current = e.touches[0].clientX;
  }

  function scrollAction(e) {
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (currentSection === "trucks") snapTruckScroll();
      if (currentSection === "wheels") snapWheelsScroll();
    }, 1000 / 16);
    let scrollDelta;

    if (touchDevice) {
      const touchDelta = prevTouchX.current - e.touches[0].clientX;
      scrollDelta = touchDelta * 0.0009;
    } else {
      scrollDelta = e.deltaY * 0.0009;
    }

    if (currentSection === "board") {
      setCameraActiveStatus(true);
      const cameraX = cameraControlsRef.current.camera.position.x;

      const startX = positions[0].x;
      const endX = positions[positions.length - 1].x;

      if (cameraX <= startX && scrollDelta < 0) return;
      if (cameraX >= endX && scrollDelta > 0) return;

      cameraControlsRef.current.truck(scrollDelta, 0, true);
    }

    if (currentSection === "trucks") {
      const startX = 0;
      const endX = (trucksInfo.length - 1) * trucksGap * -1;
      const currentPosX = trucksGroupContainerRef.current.position.x;

      if (currentPosX >= startX && scrollDelta < 0) return;
      if (currentPosX <= endX && scrollDelta > 0) return;

      const trucksGroup = scene.children[1].children[0].children[1];

      gsapCtx.current.scrollPosX(
        [trucksGroupContainerRef.current.position, trucksGroup.position],
        `-=${scrollDelta}`
      );
    }

    if (currentSection === "wheels") {
      const startX = 0;
      const endX = (wheelsInfo.length - 1) * wheelsGap * -1;
      const currentPosX = wheelsGroupContainerRef.current.position.x;

      if (currentPosX >= startX && scrollDelta < 0) return;
      if (currentPosX <= endX && scrollDelta > 0) return;

      gsapCtx.current.scrollPosX(
        [wheelsGroupContainerRef.current.position],
        `-=${scrollDelta}`
      );

      const indexPos = Math.abs(
        wheelsGroupContainerRef.current.position.x / wheelsGap
      );
      const currIndex = parseInt(indexPos);
      const p = indexPos % 1;

      wheelUniformRef.current.texture1.value = wheelTextures[currIndex];
      wheelUniformRef.current.texture2.value = wheelTextures[currIndex + 1];
      wheelUniformRef.current.mixValue.value = p;

      const wheel =
        meshGroupRef.current.children[0].children[1].children[0].children[2]
          .children[3];

      const rx = gsap.utils.mapRange(
        startX,
        endX,
        wheelRotations[0],
        wheelRotations[wheelRotations.length - 1],
        wheelsGroupContainerRef.current.position.x
      );
      wheel.rotation.x = rx;
    }

    if (
      currentSection === "finish" &&
      rotatePreview === true &&
      touchDevice === false
    ) {
      const currentBoardGroup = meshGroupRef.current.children[0];

      currentBoardGroup.rotation.y += scrollDelta;
    }
  }

  useGesture(
    {
      onDrag: (e) => {
        if (currentSection === "finish" && rotatePreview === true) {
          const currentBoardGroup = meshGroupRef.current.children[0];
          const d = e.delta[0] * 0.009;

          currentBoardGroup.rotation.y += d;
        }
      },
    },
    { target: canvasContainerRef }
  );

  function snapScroll(indexToSnapTo) {
    setCameraActiveStatus(false);
    if (indexToSnapTo !== undefined) {
      setCurrentDeckIndex(indexToSnapTo);

      cameraControlsRef.current.truck(
        positions[indexToSnapTo].x - camera.position.x,
        0,
        true
      );
      return;
    }
    let snapIndex = null;
    let minDistance = Infinity;

    positions.forEach((p, i) => {
      const d = Math.abs(camera.position.x - p.x);
      if (d < minDistance) {
        snapIndex = i;
        minDistance = d;
      }
    });

    setCurrentDeckIndex(snapIndex);
    cameraControlsRef.current.truck(
      positions[snapIndex].x - camera.position.x,
      0,
      true
    );
  }

  function snapTruckScroll(indexToSnapTo) {
    if (indexToSnapTo !== undefined) {
      setCurrentTruckIndex(indexToSnapTo);
      gsapCtx.current.scrollTrucks(indexToSnapTo);
      return;
    }

    if (currentSection !== "trucks") return;
    let snapIndex = null;
    let minDistance = Infinity;

    trucksHtmlPositions.forEach((p, i) => {
      const d = Math.abs(-p - trucksGroupContainerRef.current.position.x);

      if (d < minDistance) {
        snapIndex = i;
        minDistance = d;
      }
      setCurrentTruckIndex(snapIndex);
    });
    gsapCtx.current.scrollTrucks(snapIndex);
  }

  function snapWheelsScroll(indexToSnapTo) {
    let snapIndex = null;
    let minDistance = Infinity;

    if (indexToSnapTo !== undefined) {
      setCurrentWheelIndex(indexToSnapTo);
      gsapCtx.current.scrollWheels(indexToSnapTo);
      return;
    }
    if (currentSection !== "wheels") return;

    wheelsHtmlPositions.forEach((p, i) => {
      const d = Math.abs(-p - wheelsGroupContainerRef.current.position.x);

      if (d < minDistance) {
        snapIndex = i;
        minDistance = d;
      }
    });

    setCurrentWheelIndex(snapIndex);
    gsapCtx.current.scrollWheels(snapIndex);
  }

  function selectDeck() {
    if (cameraActive) return;
    addSelection([...selections, deckInfo[currentDeckIndex]]);
    setCurrentSection("trucks");

    if (gsapCtx.current)
      gsapCtx.current.boardToTrucksTransition(currentDeckIndex);
  }

  function selectTrucks() {
    addSelection([...selections, trucksInfo[currentTruckIndex]]);
    setCurrentSection("wheels");
    const selectedTrucks =
      meshGroupRef.current.children[0].children[1].children[currentTruckIndex];

    meshGroupRef.current.children[0].children[1].children = [selectedTrucks];
    gsapCtx.current.trucksToWheelsTransition(currentTruckIndex);
  }

  function selectWheels() {
    addSelection([...selections, wheelsInfo[currentWheelIndex]]);
    setCurrentSection("finish");
    gsapCtx.current.wheelsToFinishTransition();
  }

  function selectItem() {
    if (currentSection === "trucks") {
      selectTrucks();
    } else if (currentSection === "wheels") {
      selectWheels();
    }
  }

  return (
    <>
      <Environment files="warehouse.hdr" />
      <CameraControls
        ref={cameraControlsRef}
        onChange={(e) => {
          bottomGroupHtmlRef.current.position.setX(e.target.camera.position.x);
          topHtmlGroupRef.current.position.setX(e.target.camera.position.x);
        }}
      />
      <group ref={topHtmlGroupRef} position-y={0.588}>
        <Html center>
          <Top />
        </Html>
        <group position-y={-0.1} name="section-headline-group">
          <Html center wrapperClass="section-headline-container">
            <SectionHeadline headlineText={headlineText} />
          </Html>
        </group>

        <group ref={trucksGroupContainerRef} name="trucks-container">
          {trucksInfo.map((t, i) => {
            const r = Math.PI * 2 * i;
            trucksHtmlPositions.push(i * trucksGap);
            wheelRotations.push(3.10787983 + r);

            return (
              <group position-y={-0.24} position-x={i * trucksGap} key={i}>
                <Html center className="t-html-container">
                  <TrucksHtml
                    info={t}
                    index={i}
                    trucksGroupContainerRef={trucksGroupContainerRef}
                    snapTruckScroll={snapTruckScroll}
                    currentSection={currentSection}
                    positionX={i * trucksGap}
                  />
                </Html>
              </group>
            );
          })}
        </group>

        <group ref={wheelsGroupContainerRef}>
          {wheelsInfo.map((w, i) => {
            wheelsHtmlPositions.push(i * wheelsGap);
            return (
              <group position-y={-0.24} position-x={i * wheelsGap} key={i}>
                <Html center className="w-html-container">
                  <WheelsHtml
                    info={w}
                    index={i}
                    currentSection={currentSection}
                    snapWheelsScroll={snapWheelsScroll}
                  />
                </Html>
              </group>
            );
          })}
        </group>

        <group ref={detailGroupRef} position-y={-0.42}>
          <Html center>
            <div ref={detailSelectContainerRef} className="hidden w-screen">
              <Detail />
              <button
                onClick={selectItem}
                id="top-select-btn"
                className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white hidden opacity-0 m-auto"
              >
                Select
              </button>
            </div>
          </Html>
        </group>

        <group position-y={-0.35}>
          <Html center className="finish-section opacity-0">
            <FinishSection selections={selections} />
          </Html>
        </group>
        <group position-y={-1.175}>
          <Html center wrapperClass="rotate-icon-wrapper">
            <div className="w-screen flex justify-end p-8">
              <button
                onClick={() => {
                  if (currentSection !== "finish") return;
                  gsapCtx.current.toggleRotationPreview(rotatePreview);
                }}
              >
                <RotateIcon rotatePreview={rotatePreview} />
              </button>
            </div>
          </Html>
        </group>
      </group>
      <group ref={meshGroupRef} position-z={0.4}>
        {deckInfo.map((info, i) => {
          const w = 0.2;
          const gap = 0.15;
          const xW = w + gap;
          const position = new THREE.Vector3(i * xW, 0, 0);
          positions.push(position);
          return (
            <Deck
              key={i}
              index={i}
              position={position}
              //   scale={[w, 4, 1]}
              info={info}
              currentSection={currentSection}
              snapScroll={snapScroll}
              wheelUniformRef={wheelUniformRef}
            />
          );
        })}
      </group>
      <group ref={bottomGroupHtmlRef} position-y={-0.54}>
        <Html center wrapperClass="info-container">
          <div className="w-screen text-center flex flex-col gap-[2px]">
            <p className="text-xs">{deckInfo[currentDeckIndex].name}</p>
            <p>{deckInfo[currentDeckIndex].price}</p>
            <div>
              <button
                onClick={selectDeck}
                className="px-8 py-2 rounded-xl uppercase text-xs bg-black text-white"
              >
                Select
              </button>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
