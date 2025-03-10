import { Copy, EmojiLookLeft, EmojiLookRight, PinAlt } from "iconoir-react";
import Image from "next/image";
import Link from "next/link";
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Slider from "react-slick";
import Snowfall from 'react-snowfall';
import "slick-carousel/slick/slick.css";
import styled, { css } from "styled-components";
import useSWR from "swr";

import Modal from "@/components/common/Modal";
import Wrapper from '@/components/common/Wrapper';
import timeDiffFormat from "@/common/utils/timeDiffFormat";
import { useSessionStorage } from "@/common/hooks/useStorage";
import coverPic from "@/public/photos/cover.jpg";
import mapPic from "@/public/photos/map.jpg";
import pinIcon from '@/public/location-pin.png';
import { INFORMATION } from '@/components/common/value';
import AttendModal from '@/components/common/AttendModal';
// import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/style.css';
// import { Container as MapDiv, NaverMap, Marker, useNavermaps} from 'react-naver-maps';
import { GetTalkListResponse, Party, Talk } from "@/talk/types";
import {
  BoxShadowStyle,
  BubbleHeadStyle,
  Main,
  SectionHeader,
  SectionHr,
  TextSansStyle,
} from "./styles";
import WriteTalk from "./talk/WriteTalk";
import EditTalk from "./talk/EditTalk";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";

// const navermaps = useNavermaps()

const Header = styled.h1`
  display: inline-block;
  margin: 40px 0;

  font-size: 20px;
  font-weight: 900;
  line-height: 2.5;

  hr {
    width: 70%;
    margin: 0 auto;
    border: 0;
    border-top: 1px solid #ccc;
  }
`;

const CoverPicWrap = styled.div`
  width: 90%;
  margin: 0 auto;
  margin-bottom: 40px;
  border-radius: 30px;
  overflow: hidden;
  line-height: 0;
`;

const imageSize = 16;

const LiveButton = styled.button`
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  margin: 12px 10px;
  color: white;
  font-size: 16px;
  font-weight: 900;
  background: rgba(255, 136, 170);

  animation: color-change 1s infinite;

  @keyframes color-change {
    0% {
      background: rgba(255, 136, 170, 0.7);
    }
    50% {
      background: rgb(255, 136, 170);
    }
    100% {
      background: rgba(255, 136, 170, 0.7);
    }
  }
`;

const GreetingP = styled.p`
  margin: 30px 0;
`;

const CallWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 40px 0;
  > * {
    margin: 0 15px;
  }
`;

const CallButtonWrap = styled.div<{ bgColor: string }>`
  ${TextSansStyle}
  font-size: 13px;

  svg {
    display: block;
    margin: 0 auto;
    margin-bottom: 4px;
    width: 60px;
    height: 60px;
    color: white;
    padding: 15px;
    border-radius: 30px;
    background-color: ${({ bgColor }) => bgColor};
  }
`;

type CallButtonProps = {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
};

const CallButton = ({ icon, bgColor, label }: CallButtonProps) => (
  <>
    <CallButtonWrap bgColor={bgColor}>
      {icon}
      {label}
    </CallButtonWrap>
  </>
);

const TabButton = styled.div`
  border: 1px solid gray;
  width: 230px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  cursor: pointer;
  color: white;
  border-radius: 6px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const PhotoGrid = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 0 5px;

  li {
    height: 200px;
    flex-grow: 1;
    margin: 4px;
  }

  img {
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
  }
`;

const NoticeWrap = styled.div`
  width: 100%;
  display: flex;
  text-align: left;
  line-height: 2;
  flex-direction: column;
  border-bottom: 1px solid lightgray;
  padding: 35px 0;
  overflow: visible;

  @media only screen and (max-width: 400px) {
    padding: 33px 0;
  }
`;

const SliderWrap = styled.div<{ isZoomed: boolean }>`
  height: 100%;
  ${({ isZoomed }) =>
    isZoomed &&
    css`
      * {
        overflow: visible !important;
      }
    `}
  .slick-track {
    display: flex;
  }
  .slick-track .slick-slide {
    display: flex;

    ${({ isZoomed }) =>
      isZoomed &&
      css`
        &:not(.slick-active) {
          visibility: hidden;
        }
      `}

    height: auto;
    align-items: center;
    justify-content: center;
    div {
      outline: none;
    }
    img {
      width: 100%;
    }
  }
`;

const smallItemStyles: React.CSSProperties = {
  cursor: 'pointer',
  objectFit: 'contain',
  width: '100px',
  height: '150px',
};

type PinchPhotoProps = { src: string; onZoom: (isZoomed: boolean) => void };
const PinchPhoto = ({ src, onZoom }: PinchPhotoProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const pz = useRef<QuickPinchZoom>(null);
  const handleUpdate = useCallback(
    ({ x, y, scale }) => {
      if (!imgRef.current) return;
      const value = make3dTransformValue({ x, y, scale });
      imgRef.current.style.setProperty("transform", value);
      onZoom(scale > 1);
    },
    [onZoom]
  );

  return (
    <QuickPinchZoom ref={pz} onUpdate={handleUpdate} draggableUnZoomed={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={src} alt="" />
    </QuickPinchZoom>
  );
};

type PhotoGalleryProps = { initialSlide?: number; onClose: () => void };
const PhotoGallery = ({ initialSlide, onClose }: PhotoGalleryProps) => {
  const [isZoomed, setZoomed] = useState(false);
  return (
    <SliderWrap isZoomed={isZoomed} onClick={onClose}>
      <Slider
        initialSlide={initialSlide || 0}
        slidesToShow={1}
        slidesToScroll={1}
        arrows={false}
        dots={false}
      >
        {Array.from(Array(imageSize), (_, i) => i + 1).map((i) => (
          <div key={i}>
            <PinchPhoto onZoom={setZoomed} src={`/photos/f${i}.jpg`} />
          </div>
        ))}
      </Slider>
    </SliderWrap>
  );
};

const MapButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #666;
  font-size: 13px;
  text-decoration: none;
  background: #f3f3f3;
  line-height: 1.3;
  > svg {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: -4px 0;
    margin-right: 4px;
  }
`;

const GiveWrap = styled.div`
  display: inline-block;
  text-align: left;
  line-height: 2;
`;

const [openGroomAccount, setOpenGroomAccount] = useState<boolean>(false);
const [openBrideAccount, setOpenBrideAccount] = useState<boolean>(false);

const AccountWrapper = styled.div`
  margin: 0 auto;
  width: max(75%, 290px);
  transition: height 0.6s;
  transition-timing-function: cubic-bezier(0.15, 0.82, 0.165, 1);
  overflow: hidden;
`;

const AccountOwner = styled.div`
  font-family: Pretendard;
  width: 100%;
  padding-top: 20px;
`;

const AccountItem = styled.div`
  font-family: Pretendard;
  margin-top: 8px;
  height: 40px;
  width: 100%;
  background-color: white;
  display: flex;
  padding: 12px;
  align-items: center;
  position: relative;

  & > button {
    position: absolute;
    top: 1px;
    right: 2px;
    font-family: Pretendard;
    background-color: white;
    border: 1px solid #c6c6c6;
    box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.2);
    padding: 6px 8px;
    font-size: 15px;
    color: #555555;
    cursor: pointer;
  }
`;

const onClickCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`${text}\n계좌번호가 복사되었습니다.`);
  } catch (err) {
    console.error(err);
  }
};

const CopyTextButton = styled.button`
  padding: 0;
  border: none;
  background: none;

  svg {
    width: 20px;
    height: 20px;
    padding: 2px;
    color: #999;
    vertical-align: sub;
  }
`;
const CopyText = ({ text }: { text: string }) => {
  const handleCopyText = () => {
    const fallbackCopyClipboard = (value: string) => {
      const $text = document.createElement("textarea");
      document.body.appendChild($text);
      $text.value = value;
      $text.select();
      document.execCommand("copy");
      document.body.removeChild($text);
    };

    navigator.clipboard
      .writeText(text)
      .catch(() => fallbackCopyClipboard(text))
      .then(() => alert("계좌번호가 복사 되었습니다."));
  };
  return (
    <>
      {text}
      <CopyTextButton onClick={handleCopyText} aria-label="복사">
        <Copy />
      </CopyTextButton>
    </>
  );
};

const WriteSectionSubHeader = styled.div`
  padding: 0 20px;
  margin-top: -68px;
  color: #666;
  p:first-child {
    float: left;
  }
  p:last-child {
    float: right;
  }
`;

const WriteButton = styled.button<{ visible: boolean }>`
  ${TextSansStyle}
  ${({ visible }) =>
    visible
      ? css`
          bottom: 45px;
        `
      : css`
          bottom: -100px;
        `}

  position: fixed;
  left: 50%;
  transform: translateX(-50%);

  width: calc(100% - 40px);
  max-width: calc(400px - 40px);
  padding: 16px;
  border: 0;
  border-radius: 8px;

  color: white;
  font-size: 16px;
  font-weight: 900;
  background: rgba(255, 136, 170, 0.9);

  ${BoxShadowStyle}

  transition: bottom 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
`;

const TalkWrap = styled.div`
  position: relative;
  padding: 0 20px;
  margin: 20px 0;
`;

const WriteButtonTrigger = styled.div`
  position: absolute;
  top: 100px;
  height: 100%;
`;

const TalkBubbleWrap = styled.div<{
  party: Party;
  color: string;
  selected: boolean;
}>`
  ${TextSansStyle}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  svg {
    ${({ party, color }) => BubbleHeadStyle(party, color)}
  }
  > div {
    ${({ party }) =>
      party === "BRIDE"
        ? css`
            margin-right: 44px;
            text-align: right;
          `
        : css`
            margin-left: 44px;
            text-align: left;
          `}
    line-height: 1.3;
    div.bubble-info-wrap {
      display: flex;
      ${({ party }) =>
        party === "BRIDE"
          ? css`
              flex-direction: row-reverse;
            `
          : css`
              flex-direction: row;
            `}

      p {
        white-space: pre-wrap;
        text-align: left;
        word-break: break-all;
        overflow-wrap: break-word;
        display: inline-block;
        padding: 8px 12px;
        margin: 4px 0 0 0;
        ${({ party }) =>
          party === "BRIDE"
            ? css`
                border-radius: 20px 4px 20px 20px;
                margin-left: 3px;
              `
            : css`
                border-radius: 4px 20px 20px 20px;
                margin-right: 3px;
              `}
        background: #eee;
        ${({ selected }) =>
          selected &&
          css`
            background: #ddd;
          `}
      }
      small {
        align-self: flex-end;
        flex-shrink: 0;
        color: #999;
        font-size: 11px;
      }
    }
    .edit {
      font-size: 0.9em;
      color: #999;
      text-decoration: underline;
    }
  }
`;

type TalkBubbleProps = {
  talk: Talk;
  selected: boolean;
  onBubbleClick: (id: string | undefined) => void;
  onEditClick: (id: string) => void;
};
const TalkBubble = ({
  talk,
  selected,
  onBubbleClick,
  onEditClick,
}: TalkBubbleProps) => {
  const handleBubbleClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onBubbleClick(talk.id);
  };
  const handleBubbleOutsideClick: MouseEventHandler = (e) =>
    onBubbleClick(undefined);
  const handleEditClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onEditClick(talk.id);
  };
  const editBtn = (
    <span className="edit" onClick={handleEditClick}>
      수정하기
    </span>
  );
  return (
    <TalkBubbleWrap party={talk.party} color={talk.color} selected={selected}>
      {talk.party === "BRIDE" ? <EmojiLookLeft /> : <EmojiLookRight />}
      <div onClick={handleBubbleOutsideClick}>
        {selected && talk.party === "BRIDE" && <>{editBtn} </>}
        {talk.author}
        {selected && talk.party === "GROOM" && <> {editBtn}</>}
        <div className="bubble-info-wrap">
          <p onClick={handleBubbleClick}>{talk.msg}</p>
          <small>
            {!talk.published
              ? "검수중"
              : timeDiffFormat(new Date(talk.created))}
          </small>
        </div>
      </div>
    </TalkBubbleWrap>
  );
};

const ThankYou = styled.div`
  padding: 60px;
  color: #666;
`;

const Home = () => {
  const [writeDone, setWriteDone] = useSessionStorage("talk.writedone");
  const {
    data: talkListResp,
    error,
    mutate,
  } = useSWR<GetTalkListResponse>("/api/talk/list");

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showWriteTalkModal, setShowWriteTalkModal] = useState(false);
  const [showEditTalkModal, setShowEditTalkModal] = useState<Talk>();
  const [isWriteButtonShown, setWriteButtonShown] = useState(false);
  const [lastClickedGalleryItem, setLastClickedGalleryItem] =
    useState<number>();
  const [selectedTalkId, setSelectedTalkId] = useState<string>();

  const writeButtonTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!writeButtonTriggerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setWriteButtonShown(entry.isIntersecting);
    });
    observer.observe(writeButtonTriggerRef.current);

    return () => observer.disconnect();
  }, [writeButtonTriggerRef]);

  const handlePhotoClick = (i: number) => {
    setLastClickedGalleryItem(i);
    setShowGalleryModal(true);
  };

  const handleGalleryModalClose = () => setShowGalleryModal(false);

  const handleTalkBubbleClick = (id: string | undefined) =>
    setSelectedTalkId(id);

  const handleWriteButtonClick = () => setShowWriteTalkModal(true);
  const handleWriteTalk = (_: string) => {
    setWriteDone("done");
    setShowWriteTalkModal(false);
    mutate();
  };
  const handleWriteTalkModalClose = () => setShowWriteTalkModal(false);

  const handleTalkEditClick = (id: string) => {
    const talk = talkListResp?.talks?.find((t) => t.id === id);
    if (!talk) return;
    setShowEditTalkModal(talk);
    setSelectedTalkId(undefined);
  };
  const handleEditTalk = (_: string) => {
    setWriteDone("done");
    setShowEditTalkModal(undefined);
    mutate();
  };
  const handleEditTalkModalClose = () => setShowEditTalkModal(undefined);

  return (
    <Main>
      <Header>
        Denny & Miran
      </Header>
      <CoverPicWrap>
        <Image src={coverPic} priority={true} placeholder="blur" alt="" />
      </CoverPicWrap>
      <p>
        2025.9.21 SUN 5:30PM
        <br />
        Bonelli Garden
      </p>


      <SectionHr />

      <SectionHeader style={{ color: "#F08080" }}>Invitation</SectionHeader>
      <GreetingP>
        <Snowfall
            color="#f5b87a" //gold
            snowflakeCount={30}
            radius={[1, 5]}
            // images={['🌻']}
            speed={[0.2, 1]}
            style={{ opacity: 0.35 }}
          />
        청명한 가을날
        <br />
        소중한 분들의 축복 속에서
        <br />
        한 가정을 이루려고 합니다.
        <br />
        
        <br />
        설레는 이 시작의 순간에
        <br />
        함께 자리를 빛내주시면 감사하겠습니다.
      </GreetingP>
      <GreetingP>
        (故)오종호 · 지승희의 아들 현규
        <br />
        오혜근 · 홍영예의 딸 미란
      </GreetingP>
      <SectionHr />
      <PhotoGrid>
        {Array.from(Array(imageSize), (_, i) => i).map((i) => (
          <li key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              role="button"
              src={`/photos/g${i + 1}.jpg`}
              onClick={() => handlePhotoClick(i)}
              loading="lazy"
              alt=""
            />
          </li>
        ))}
      </PhotoGrid>
      {showGalleryModal && (
        <Modal handleClose={handleGalleryModalClose}>
          <PhotoGallery
            initialSlide={lastClickedGalleryItem}
            onClose={handleGalleryModalClose}
          />
        </Modal>
      )}
      <SectionHr />
      <SectionHeader style={{ color: "#F08080" }}>🧭 Location</SectionHeader>
      <p>
        <br />
        Bonelli Garden
        <br />
        11 Saemmaru-gil, Naegok-dong
        <br />
        Seocho District, Seoul
        <br />
        📞 +82-2-451-6166
      </p>

      <p>
        <br/>
        <b style={{ color: "#F08080" }}>Shuttle Bus</b>
        <br />
        Shinbundang Line, Yangjae Citizen's Forest Station Exit 4
        <br />
        <br />
        <b style={{ color: "#F08080" }}>Parking</b>
        <br />
        34-14 Saemmaru-gil, Seocho District, Seoul
        <br />
        서초과학화예비군훈련장 강동송파주차장
      </p>

      <SectionHr />
      <SectionHeader style={{ color: "#F08080" }}>🪧 Information</SectionHeader>
      <NoticeWrap
            style={{
              margin: '40px 0 0 0',
              border: '4px double lightgray',
              alignItems: 'center',
              padding: '30px 0 56px',
            }}
          >
        <p>
          4:00-5:30pm | Welcome drink & Photo booth 📷
          <br />
          5:30-6:00pm | Wedding ceremony
          <br />
          6:00-7:00pm | Dinner
          <br />
          7:00-8:30pm | Afterparty
        </p>
      </NoticeWrap>
      <p>
        오랜만에 뵙는 분들, 먼 곳에서 오시는 분들
        <br />
        모두 짧게 인사드리기 아쉬워
        <br />
        본식 전후로 시간을 마련했습니다.
        <br /><br />
        예식 전 설치될 포토부스에서
        <br />
        마음껏 사진 찍으시고
        <br />
        방명록도 남겨주세요:)
        <br />
        인원 수 x 2장씩 인쇄되니
        <br />
        한 장은 소장하실 수 있습니다. 😊
        <br />
      </p>

      <SectionHr />
      <SectionHeader style={{ color: "#F08080" }}>🌸 마음 전하실 곳</SectionHeader>

        <TabButton
          style={{ backgroundColor: '#F08080' }}
          onClick={() => setOpenBrideAccount(!openBrideAccount)}
        >
          <strong>👰🤵 신랑 & 신부</strong>
        </TabButton>
        <AccountWrapper style={{ height: openBrideAccount ? '310px' : 0 }}>
          {INFORMATION.bride.map((info) => (
            <div key={info.name}>
              <AccountOwner>
                {info.bank} ({info.name})
              </AccountOwner>
              <AccountItem>
                {info.accountNumber}
                <button
                  onClick={() => {
                    onClickCopy(info.accountNumber);
                  }}
                >
                  복사
                </button>
              </AccountItem>
            </div>
          ))}
        </AccountWrapper>
          <br />
          오미란 국민은행 <CopyText text="9-10-5674-1102" />
          <br />
        <TabButton
          style={{ backgroundColor: '#004D7A' }}
          onClick={() => setOpenGroomAccount(!openGroomAccount)}
        >
          <strong>👰 신부측</strong>
        </TabButton>
        <AccountWrapper style={{ height: openBrideAccount ? '310px' : 0 }}>
          {INFORMATION.bride.map((info) => (
            <div key={info.name}>
              <AccountOwner>
                {info.bank} ({info.name})
              </AccountOwner>
              <AccountItem>
                {info.accountNumber}
                <button
                  onClick={() => {
                    onClickCopy(info.accountNumber);
                  }}
                >
                  복사
                </button>
              </AccountItem>
            </div>
          ))}
        </AccountWrapper>
          <br />
          홍영예 국민은행 <CopyText text="9-10-5674-1102" />
          <br />
          오혜근 <CopyText text="xxxxx-xxxxxxxx" />
        <TabButton
          style={{ backgroundColor: '#004D7A' }}
          onClick={() => setOpenGroomAccount(!openGroomAccount)}
        >
          <strong>🤵 신랑측</strong>
        </TabButton>
        <AccountWrapper style={{ height: openGroomAccount ? '310px' : 0 }}>
          {INFORMATION.groom.map((info) => (
            <div key={info.name}>
              <AccountOwner>
                {info.bank} ({info.name})
              </AccountOwner>
              <AccountItem>
              <CopyText text={info.accountNumber} />
              </AccountItem>
            </div>
          ))}
        </AccountWrapper>
        <br />
          예시 <CopyText text="예시 계좌번호" />
          <br />
        <TabButton
          style={{ backgroundColor: '#004D7A' }}
          onClick={() => setOpenGroomAccount(!openGroomAccount)}
        >
      {/* <GiveWrap>
      </GiveWrap> */}

      <SectionHr />
      <SectionHeader style={{ color: "#F08080" }}>💬 축하의 한마디</SectionHeader>
      <WriteSectionSubHeader>
        <p>신랑측</p>
        <p>신부측</p>
      </WriteSectionSubHeader>
      <div style={{ clear: "both" }} />
      <TalkWrap>
        <WriteButtonTrigger ref={writeButtonTriggerRef} />
        {talkListResp?.talks.map((talk) => (
          <TalkBubble
            key={talk.id}
            talk={talk}
            selected={talk.id === selectedTalkId}
            onBubbleClick={handleTalkBubbleClick}
            onEditClick={handleTalkEditClick}
          />
        ))}
      </TalkWrap>
      <ThankYou>{writeDone ? "감사합니다." : ""}</ThankYou>
      {!writeDone && (
        <WriteButton
          visible={isWriteButtonShown}
          onClick={handleWriteButtonClick}
        >
          😍 나도 한마디
        </WriteButton>
      )}
      {showWriteTalkModal && (
        <Modal handleClose={handleWriteTalkModalClose}>
          <WriteTalk onWrite={handleWriteTalk} />
        </Modal>
      )}
      {showEditTalkModal && (
        <Modal handleClose={handleEditTalkModalClose}>
          <EditTalk talk={showEditTalkModal} onEdit={handleEditTalk} />
        </Modal>
      )}
    </Main>
  );
};

export default Home;
