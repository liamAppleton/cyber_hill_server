const db = require('../../database/db');

const fetchRelationships = () => {
    return db.query('SELECT * FROM record_relationships')
        .then(([rows]) => {
            return rows;
        })
}

const fetchRelationshipById = (record_relationship_id) => {
    return db.query('SELECT * FROM record_relationships WHERE record_relationship_id = ?', [record_relationship_id])
        .then(([rows]) => {
            return rows[0]
        })
}

const addRelationship = ({
  source_record_type,
  source_record_id,
  target_record_type,
  target_record_id,
  relationship_type,
  created_by
}) => {
  return db.query(
    `
      INSERT INTO record_relationships (
        source_record_type,
        source_record_id,
        target_record_type,
        target_record_id,
        relationship_type,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      source_record_type,
      source_record_id,
      target_record_type,
      target_record_id,
      relationship_type,
      created_by
    ]
  )
  .then(([result]) => {
    return {
      record_relationship_id: result.insertId,
      source_record_type,
      source_record_id,
      target_record_type,
      target_record_id,
      relationship_type,
      created_by
    };
  });
};

const removeRelationship = (record_relationship_id) => {
    return db.query('DELETE FROM record_relationships WHERE record_relationship_id = ?', [record_relationship_id])
        .then(([result]) => {
            return result.affectedRows
        })
}

const fetchRelationshipsByRecord = (record_type, relationship_record_id) => {
  return db.query(
    `
      SELECT *
      FROM record_relationships
      WHERE
        (
          source_record_type = ?
          AND source_record_id = ?
        )
        OR
        (
          target_record_type = ?
          AND target_record_id = ?
        )
    `,
    [
      record_type,
      relationship_record_id,
      record_type,
      relationship_record_id
    ]
  )
  .then(([rows]) => {
    return rows;
  });
};

const fetchStatusHistoryByRecord = (record_type, relationship_record_id) => {
  return db.query(
    `SELECT *
    FROM status_history
    WHERE record_type = ?
      AND record_id = ?
    ORDER BY changed_at DESC, status_history_id DESC`,
    [record_type, relationship_record_id]
  ).then(([rows]) => rows);
};

module.exports = {
    fetchRelationships,
    fetchRelationshipById,
    addRelationship,
    removeRelationship,
    fetchRelationshipsByRecord,
    fetchStatusHistoryByRecord
};