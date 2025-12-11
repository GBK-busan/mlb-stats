import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVenue, fetchWikipediaSummary } from "../../api/mlbApi";
import "./VenueDetail.css";

export default function VenueDetail() {
  const { venueId } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [wiki, setWiki] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // 1) MLB StatsAPI에서 venue 기본 정보 가져오기
        const v = await fetchVenue(venueId);
        setVenue(v);

        // 2) venue 이름으로 Wikipedia 요약 가져오기
        if (v?.name) {
          const wikiData = await fetchWikipediaSummary(v.name);
          setWiki(wikiData);
        } else {
          setWiki(null);
        }
      } catch (e) {
        console.error("Failed to load venue:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [venueId]);

  const loc = venue?.location || {};
  const coord = loc.coordinates || {};
  const field = venue?.fieldInfo || {};

  const hasFieldInfo = useMemo(
    () =>
      !!(
        field.capacity ||
        field.turfType ||
        field.leftLine ||
        field.leftCenter ||
        field.center ||
        field.rightCenter ||
        field.rightLine
      ),
    [field]
  );

  const hasLocation = useMemo(
    () =>
      !!(
        loc.address1 ||
        loc.city ||
        loc.state ||
        loc.country ||
        coord.latitude ||
        coord.longitude
      ),
    [loc, coord]
  );

  if (loading) {
    return (
      <main className="venue-detail">
        <p>구장 정보를 불러오는 중...</p>
      </main>
    );
  }

  if (!venue) {
    return (
      <main className="venue-detail">
        <button className="back-link" onClick={() => navigate(-1)}>
          ◀ 이전 페이지로
        </button>
        <p>구장 정보를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const mapUrl =
    coord.latitude && coord.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${coord.latitude},${coord.longitude}`
      : null;

  return (
    <main className="venue-detail">
      <button className="back-link" onClick={() => navigate(-1)}>
        ◀ 이전 페이지로
      </button>

      {/* 상단 헤더 */}
      <section className="venue-header">
        <div className="venue-header-main">
          <h1>{venue.name}</h1>

          {hasLocation ? (
            <>
              <p className="venue-location">
                {[loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
              </p>
              {loc.address1 && <p className="venue-address">{loc.address1}</p>}
            </>
          ) : (
            <p className="venue-location">
              시즌: {venue.season || "-"}
              {venue.id && ` · Venue ID: ${venue.id}`}
            </p>
          )}
        </div>

        <div className="venue-meta-box">
          {venue.active !== undefined && (
            <div className="venue-chip">
              {venue.active ? "사용 중" : "사용 종료"}
            </div>
          )}

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="venue-map-link"
            >
              📍 지도에서 보기
            </a>
          )}
        </div>
      </section>

      {/* StatsAPI 기준 구장 정보 */}
      <section className="venue-section">
        <h2>구장 정보</h2>

        {hasFieldInfo ? (
          <div className="venue-info-grid">
            <div className="venue-info-item">
              <span className="label">수용 인원</span>
              <span className="value">
                {field.capacity ? field.capacity.toLocaleString("ko-KR") : "-"}
              </span>
            </div>
            <div className="venue-info-item">
              <span className="label">잔디 타입</span>
              <span className="value">{field.turfType || "-"}</span>
            </div>
            <div className="venue-info-item">
              <span className="label">왼쪽 라인 (LF)</span>
              <span className="value">
                {field.leftLine ? `${field.leftLine} ft` : "-"}
              </span>
            </div>
            <div className="venue-info-item">
              <span className="label">좌중간 (LCF)</span>
              <span className="value">
                {field.leftCenter ? `${field.leftCenter} ft` : "-"}
              </span>
            </div>
            <div className="venue-info-item">
              <span className="label">중견수 (CF)</span>
              <span className="value">
                {field.center ? `${field.center} ft` : "-"}
              </span>
            </div>
            <div className="venue-info-item">
              <span className="label">우중간 (RCF)</span>
              <span className="value">
                {field.rightCenter ? `${field.rightCenter} ft` : "-"}
              </span>
            </div>
            <div className="venue-info-item">
              <span className="label">오른쪽 라인 (RF)</span>
              <span className="value">
                {field.rightLine ? `${field.rightLine} ft` : "-"}
              </span>
            </div>
          </div>
        ) : (
          <p className="venue-extra">
            StatsAPI에서 이 구장의 상세 필드 정보는 제공되지 않습니다.
          </p>
        )}
      </section>

      {/* Wikipedia 정보 (사진 + 설명) */}
      {wiki && (
        <section className="venue-wiki-section">
          <div className="venue-wiki-header">
            {wiki.thumbnail && (
              <img
                src={wiki.thumbnail.source}
                alt={wiki.title}
                className="venue-picture"
              />
            )}

            <div className="venue-wiki-text">
              <h2>{wiki.title}</h2>
              {wiki.description && (
                <p className="venue-desc">{wiki.description}</p>
              )}
            </div>
          </div>

          {wiki.extract && <p className="venue-extract">{wiki.extract}</p>}

          {wiki.content_urls?.desktop?.page && (
            <a
              href={wiki.content_urls.desktop.page}
              target="_blank"
              rel="noreferrer"
              className="wiki-link"
            >
              Wikipedia에서 더 보기 →
            </a>
          )}
        </section>
      )}
    </main>
  );
}
