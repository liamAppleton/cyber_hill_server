
const recordRelationshipsData = [
    {
        source_record_type: 'vulnerability',
        source_record_id: 1,
        target_record_type: 'asset',
        target_record_id: 1,
        relationship_type: 'affects',
        created_by: 1
    },
    {
        source_record_type: 'vulnerability',
        source_record_id: 2,
        target_record_type: 'asset',
        target_record_id: 2,
        relationship_type: 'affects',
        created_by: 1
    },
    {
        source_record_type: 'vulnerability',
        source_record_id: 1,
        target_record_type: 'project',
        target_record_id: 1,
        relationship_type: 'tracked_in',
        created_by: 1
    },
    {
        source_record_type: 'vendor',
        source_record_id: 2,
        target_record_type: 'vendor_risk',
        target_record_id: 3,
        relationship_type: 'has_risk',
        created_by: 1
    },
    {
        source_record_type: 'vendor',
        source_record_id: 1,
        target_record_type: 'vendor_risk',
        target_record_id: 1,
        relationship_type: 'has_risk',
        created_by: 1
    },
    {
        source_record_type: 'vendor_risk',
        source_record_id: 3,
        target_record_type: 'project',
        target_record_id: 3,
        relationship_type: 'addressed_by',
        created_by: 1
    },
    {
        source_record_type: 'vendor_risk',
        source_record_id: 4,
        target_record_type: 'project',
        target_record_id: 1,
        relationship_type: 'tracked_in',
        created_by: 1
    },
    {
        source_record_type: 'project',
        source_record_id: 2,
        target_record_type: 'project',
        target_record_id: 1,
        relationship_type: 'depends_on',
        created_by: 1
    },
    {
        source_record_type: 'threat_article',
        source_record_id: 1,
        target_record_type: 'vulnerability',
        target_record_id: 1,
        relationship_type: 'identifies',
        created_by: 1
    },
    {
        source_record_type: 'threat_article',
        source_record_id: 2,
        target_record_type: 'project',
        target_record_id: 2,
        relationship_type: 'relevant_to',
        created_by: 1
    }
];

module.exports = recordRelationshipsData;
