package com.geocell.survey.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Table(name = "surveys")
public class SurveyData {
    @Id
    @NotNull
    private String id;

    @NotNull
    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime timestamp;

    @NotNull
    @Embedded
    private Location location;

    @NotEmpty
    @ElementCollection
    @CollectionTable(name = "survey_polygon_points", joinColumns = @JoinColumn(name = "survey_id"))
    private List<PolygonPoint> polygonPoints;

    @NotNull
    @Column(nullable = false)
    private String surveyorId;

    private String description;

    @ElementCollection
    @CollectionTable(name = "survey_metadata", joinColumns = @JoinColumn(name = "survey_id"))
    @MapKeyColumn(name = "metadata_key")
    @Column(name = "metadata_value")
    private Map<String, String> metadata;

    @Embeddable
    @Data
    public static class Location {
        @NotNull
        @Column(nullable = false)
        private Double latitude;

        @NotNull
        @Column(nullable = false)
        private Double longitude;
    }

    @Embeddable
    @Data
    public static class PolygonPoint {
        @NotNull
        @Column(nullable = false)
        private Double latitude;

        @NotNull
        @Column(nullable = false)
        private Double longitude;

        private Double elevation;
    }
}
