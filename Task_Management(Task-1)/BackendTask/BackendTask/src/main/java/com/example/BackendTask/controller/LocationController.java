package com.example.BackendTask.controller;

import com.example.BackendTask.dto.StateDTO;
import com.example.BackendTask.dto.DistrictDTO;
import com.example.BackendTask.dto.MandalDTO;
import com.example.BackendTask.dto.VillageDTO;
import com.example.BackendTask.entity.State;
import com.example.BackendTask.entity.District;
import com.example.BackendTask.entity.Mandal;
import com.example.BackendTask.entity.Village;
import com.example.BackendTask.repository.StateRepository;
import com.example.BackendTask.repository.DistrictRepository;
import com.example.BackendTask.repository.MandalRepository;
import com.example.BackendTask.repository.VillageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final MandalRepository mandalRepository;
    private final VillageRepository villageRepository;

    public LocationController(StateRepository stateRepository,
                             DistrictRepository districtRepository,
                             MandalRepository mandalRepository,
                             VillageRepository villageRepository) {
        this.stateRepository = stateRepository;
        this.districtRepository = districtRepository;
        this.mandalRepository = mandalRepository;
        this.villageRepository = villageRepository;
    }

    // States endpoints
    @GetMapping("/states")
    public ResponseEntity<List<StateDTO>> getAllStates() {
        List<StateDTO> states = stateRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::stateToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(states);
    }

    @PostMapping("/states")
    public ResponseEntity<StateDTO> createState(@RequestBody StateDTO stateDTO) {
        State state = new State();
        state.setName(stateDTO.getName());
        State savedState = stateRepository.save(state);
        return ResponseEntity.status(201).body(stateToDTO(savedState));
    }

    // Districts endpoints
    @GetMapping("/states/{stateId}/districts")
    public ResponseEntity<List<DistrictDTO>> getDistrictsByState(@PathVariable Long stateId) {
        List<DistrictDTO> districts = districtRepository.findByStateIdOrderByNameAsc(stateId)
                .stream()
                .map(this::districtToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(districts);
    }

    @PostMapping("/districts")
    public ResponseEntity<DistrictDTO> createDistrict(@RequestBody DistrictDTO districtDTO) {
        State state = stateRepository.findById(districtDTO.getStateId())
                .orElseThrow(() -> new IllegalArgumentException("State not found"));
        
        District district = new District();
        district.setState(state);
        district.setName(districtDTO.getName());
        District savedDistrict = districtRepository.save(district);
        return ResponseEntity.status(201).body(districtToDTO(savedDistrict));
    }

    // Mandals endpoints
    @GetMapping("/districts/{districtId}/mandals")
    public ResponseEntity<List<MandalDTO>> getMandalsByDistrict(@PathVariable Long districtId) {
        List<MandalDTO> mandals = mandalRepository.findByDistrictIdOrderByNameAsc(districtId)
                .stream()
                .map(this::mandalToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(mandals);
    }

    @PostMapping("/mandals")
    public ResponseEntity<MandalDTO> createMandal(@RequestBody MandalDTO mandalDTO) {
        District district = districtRepository.findById(mandalDTO.getDistrictId())
                .orElseThrow(() -> new IllegalArgumentException("District not found"));
        
        Mandal mandal = new Mandal();
        mandal.setDistrict(district);
        mandal.setName(mandalDTO.getName());
        Mandal savedMandal = mandalRepository.save(mandal);
        return ResponseEntity.status(201).body(mandalToDTO(savedMandal));
    }

    // Villages endpoints
    @GetMapping("/mandals/{mandalId}/villages")
    public ResponseEntity<List<VillageDTO>> getVillagesByMandal(@PathVariable Long mandalId) {
        List<VillageDTO> villages = villageRepository.findByMandalIdOrderByNameAsc(mandalId)
                .stream()
                .map(this::villageToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(villages);
    }

    @PostMapping("/villages")
    public ResponseEntity<VillageDTO> createVillage(@RequestBody VillageDTO villageDTO) {
        Mandal mandal = mandalRepository.findById(villageDTO.getMandalId())
                .orElseThrow(() -> new IllegalArgumentException("Mandal not found"));
        
        Village village = new Village();
        village.setMandal(mandal);
        village.setName(villageDTO.getName());
        Village savedVillage = villageRepository.save(village);
        return ResponseEntity.status(201).body(villageToDTO(savedVillage));
    }

    // Helper methods for DTO conversion
    private StateDTO stateToDTO(State state) {
        StateDTO dto = new StateDTO();
        dto.setId(state.getId());
        dto.setName(state.getName());
        dto.setCreatedAt(state.getCreatedAt());
        return dto;
    }

    private DistrictDTO districtToDTO(District district) {
        DistrictDTO dto = new DistrictDTO();
        dto.setId(district.getId());
        dto.setStateId(district.getState().getId());
        dto.setName(district.getName());
        dto.setCreatedAt(district.getCreatedAt());
        return dto;
    }

    private MandalDTO mandalToDTO(Mandal mandal) {
        MandalDTO dto = new MandalDTO();
        dto.setId(mandal.getId());
        dto.setDistrictId(mandal.getDistrict().getId());
        dto.setName(mandal.getName());
        dto.setCreatedAt(mandal.getCreatedAt());
        return dto;
    }

    private VillageDTO villageToDTO(Village village) {
        VillageDTO dto = new VillageDTO();
        dto.setId(village.getId());
        dto.setMandalId(village.getMandal().getId());
        dto.setName(village.getName());
        dto.setCreatedAt(village.getCreatedAt());
        return dto;
    }
}
